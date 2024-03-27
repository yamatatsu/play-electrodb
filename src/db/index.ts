import { Temporal } from "@js-temporal/polyfill";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import NT from "neverthrow";
import { Service, EntityItem } from "electrodb";
import user from "./entities/user.js";
import userWorkspace from "./entities/userWorkspace.js";
import workspace from "./entities/workspace.js";
import gateway from "./entities/gateway.js";
import gatewayPreAttached from "./entities/gatewayPreAttached.js";
import alertSetting from "./entities/alertThreshold.js";
import alert from "./entities/alert.js";
import alertCurrent from "./entities/alertCurrent.js";
import sensorData from "./entities/sensorData.js";
import wether from "./entities/wether.js";
import { NotFoundError, SystemError } from "../errors/index.js";
import { Gateway, GatewayPreAttached } from "../models/gateway.js";
import { User } from "../models/user.js";
import { Workspace } from "../models/workspace.js";
import { SensorData } from "../models/sensor-data.js";

type UserWorkspaceItem = EntityItem<typeof userWorkspace>;
type WorkspaceItem = EntityItem<typeof workspace>;
type GatewayItem = EntityItem<typeof gateway>;
type GatewayPreAttachedItem = EntityItem<typeof gatewayPreAttached>;
type AlertItem = EntityItem<typeof alert>;

const table = "electro";
const client = new DynamoDBClient({
  endpoint: "http://127.0.0.1:8000",
  region: "local",
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
  },
});

export const service = new Service(
  {
    user,
    userWorkspace,
    workspace,
    gateway,
    gatewayPreAttached,
    alertSetting,
    alert,
    alertCurrent,
    sensorData,
    wether,
  },
  {
    table,
    client,
    // logger: (event) => {
    //   console.log(JSON.stringify(event, null, 4));
    // },
  },
);

export const UserTable = {
  create: async (user: User): Promise<void> => {
    await service.entities.user.create(user).go();
  },

  createAndAttachToWorkspace: async (
    _user: User,
    workspace: Workspace,
  ): Promise<void> => {
    await service.transaction
      .write(({ user, userWorkspace }) => [
        user.create(_user).commit(),
        userWorkspace
          .create({
            userId: _user.userId,
            workspaceId: workspace.workspaceId,
            role: "admin",
          })
          .commit(),
      ])
      .go();
  },

  get: async (
    userId: string,
  ): Promise<{
    user: User;
    workspaces: UserWorkspaceItem[];
  }> => {
    const { data } = await service.collections.user({ userId }).go();

    if (data.user.length === 0) {
      throw new Error(`user not found: ${userId}`);
    }
    if (data.user.length > 1) {
      throw new Error(`user is not unique: ${userId}`);
    }

    return {
      user: data.user[0],
      workspaces: data.userWorkspace,
    };
  },
};

export const WorkspaceTable = {
  createAndAttachUser: async (_workspace: Workspace): Promise<void> => {
    await service.transaction
      .write(({ workspace, userWorkspace }) => [
        workspace.create(_workspace).commit({ response: "all_old" }),
        userWorkspace
          .create({
            userId: _workspace.createdBy,
            workspaceId: _workspace.workspaceId,
            role: "admin",
          })
          .commit({ response: "all_old" }),
      ])
      .go();
  },

  attachGateway: async (_gateway: Gateway) => {
    await service.transaction
      .write(({ gatewayPreAttached, gateway }) => [
        gatewayPreAttached
          .delete({ registrationCode: _gateway.registrationCode })
          .commit(),
        gateway.create(_gateway).commit(),
      ])
      .go();
  },

  get: (
    workspaceId: string,
  ): NT.ResultAsync<Workspace, NotFoundError | SystemError> => {
    return wrapForSafe(
      service.entities.workspace.get({ workspaceId }).go(),
    ).andThen((res) => {
      if (!res.data) {
        return NT.err({
          name: "NotFoundError",
          resourceName: "workspace",
          payload: { workspaceId },
        } as const);
      }
      return NT.ok(res.data);
    });
  },
};

export const GatewayTable = {
  create: (
    gateway: GatewayPreAttached,
  ): NT.ResultAsync<GatewayPreAttachedItem, SystemError> => {
    return NT.fromPromise(
      service.entities.gatewayPreAttached.create(gateway).go(),
      (error) => ({ name: "SystemError", error }) as const,
    ).map((res) => res.data);
  },

  createSensorData: async (sensorData: SensorData): Promise<void> => {
    const data = { ...sensorData, timestamp: sensorData.timestamp.toString() };
    await service.entities.sensorData.create(data).go();
  },

  listByWorkspace: (
    workspace: Workspace,
  ): NT.ResultAsync<GatewayItem[], SystemError> => {
    return NT.fromPromise(
      service.entities.gateway.query
        .byWorkspaceId({ workspaceId: workspace.workspaceId })
        .go(),
      (error) => ({ name: "SystemError", error }) as const,
    ).map((res) => res.data);
  },
};

export const SensorUnit = {
  putAlert: async (data: AlertItem) => {
    await service.transaction
      .write(({ alert, alertCurrent }) => [
        alert.create(data).commit(),
        alertCurrent.create(data).commit(),
      ])
      .go();
  },
  resolveAlert: async (data: AlertItem) => {
    await service.transaction
      .write(({ alert, alertCurrent }) => [
        alert.patch(data).set({}).commit(),
        alertCurrent.delete(data).commit(),
      ])
      .go();
  },
  putAlertThreshold: async (data: {
    workspaceId: string;
    gatewayId: string;
    sensorUnitIndex: number;
    temperature: number;
  }) => {
    await service.entities.alertSetting.put(data).go();
  },
};

export const Alert = {
  listByWorkspaceId: async (workspaceId: string) => {},
};

function wrapForSafe<Result>(
  promiseResult: Promise<Result>,
): NT.ResultAsync<Result, SystemError> {
  return NT.fromPromise(
    promiseResult,
    (error) => ({ name: "SystemError", error }) as const,
  );
}
