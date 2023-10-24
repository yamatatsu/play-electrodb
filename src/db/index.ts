import { randomUUID, randomInt } from "node:crypto";
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
import sensorDataLatest from "./entities/sensorDataLatest.js";
import wether from "./entities/wether.js";
import { NotFoundError, SystemError } from "../errors/index.js";

type UserItem = EntityItem<typeof user>;
type UserWorkspaceItem = EntityItem<typeof userWorkspace>;
type WorkspaceItem = EntityItem<typeof workspace>;
type GatewayItem = EntityItem<typeof gateway>;
type GatewayPreAttachedItem = EntityItem<typeof gatewayPreAttached>;
type SensorDataItem = EntityItem<typeof sensorData>;
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
    sensorDataLatest,
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

export const User = {
  create: async (userId: string, email: string): Promise<UserItem> => {
    const res = await service.entities.user.create({ userId, email }).go();
    return res.data;
  },

  createAndAttachToWorkspace: async (
    userId: string,
    email: string,
    workspaceId: string,
  ): Promise<void> => {
    await service.transaction
      .write(({ user, userWorkspace }) => [
        user.create({ userId, email }).commit(),
        userWorkspace.create({ userId, workspaceId, role: "admin" }).commit(),
      ])
      .go();
  },

  get: async (
    userId: string,
  ): Promise<{
    user: UserItem;
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

export const Workspace = {
  createAndAttachUser: async (
    name: string,
    userId: string,
  ): Promise<{ workspaceId: string }> => {
    const workspaceId = `ws-${randomUUID()}`;
    const res = await service.transaction
      .write(({ workspace, userWorkspace }) => [
        workspace
          .create({ workspaceId, name, createdBy: userId })
          .commit({ response: "all_old" }),
        userWorkspace
          .create({ userId, workspaceId, role: "admin" })
          .commit({ response: "all_old" }),
      ])
      .go();

    return { workspaceId };
  },

  attachGateway: async (
    workspaceId: string,
    _gatewayPreAttached: GatewayPreAttachedItem,
    userId: string,
  ) => {
    await service.transaction
      .write(({ gatewayPreAttached, gateway }) => [
        gatewayPreAttached
          .delete({ registrationCode: _gatewayPreAttached.registrationCode })
          .commit(),
        gateway
          .create({ ..._gatewayPreAttached, workspaceId, attachedBy: userId })
          .commit(),
      ])
      .go();
  },

  get: (
    workspaceId: string,
  ): NT.ResultAsync<WorkspaceItem, NotFoundError | SystemError> => {
    return NT.fromPromise(
      service.entities.workspace.get({ workspaceId }).go(),
      (err) => new SystemError(err),
    ).andThen((res) => {
      if (!res.data) {
        return NT.err(new NotFoundError("workspace"));
      }
      return NT.ok(res.data);
    });
  },
};

export const Gateway = {
  create: (
    imei: string,
    gatewayName: string,
  ): NT.ResultAsync<GatewayPreAttachedItem, SystemError> => {
    const registrationCode = "A" + randomInt(99999).toString().padStart(5, "0");
    const uuid = randomUUID();

    return NT.fromPromise(
      service.entities.gatewayPreAttached
        .create({
          registrationCode,
          gatewayId: `gw-${uuid}`,
          imei: imei,
          name: gatewayName,
          sensorUnits: [...Array(6)].map((_, i) => ({
            sensorUnitId: `su-${uuid}-${i + 1}`,
            name: `sensor unit ${i + 1}`,
          })),
        })
        .go(),
      (err) => new SystemError(err),
    ).map((res) => res.data);
  },

  createSensorData: async (props: {
    gatewayId: string;
    sensorUnitIndex: number;
    timestamp: Temporal.ZonedDateTime;
    temperature: number;
    attached: boolean;
  }): Promise<void> => {
    // const data = {
    //   ...props,
    //   timestamp: props.timestamp.toString(),
    // };
    // if (props.attached) {
    //   await service.transaction
    //     .write(({ sensorData, sensorDataLatest }) => [
    //       sensorData.create(data).commit(),
    //       sensorDataLatest.create(data).commit(),
    //     ])
    //     .go();
    // } else {
    //   await service.entities.sensorData.create(data).go();
    // }
  },

  listByWorkspace: (
    workspace: WorkspaceItem,
  ): NT.ResultAsync<GatewayItem[], SystemError> => {
    // return NT.fromPromise(
    //   service.collections.gateway({ workspaceId: workspace.workspaceId }).go(),
    //   (err) => new SystemError(err),
    // ).map((res) => {
    //   const {gateway, sensorDataLatest} = res.data
    //   sensorDataLatest.reduce((acc, sensorData) => {
    //     sensorData.
    //   }, {}
    //   return
    // });
    return NT.fromPromise(
      service.entities.gateway.query
        .byWorkspaceId({ workspaceId: workspace.workspaceId })
        .go(),
      (err) => new SystemError(err),
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
