import { randomUUID } from "node:crypto";
import { Temporal } from "@js-temporal/polyfill";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Service, EntityItem } from "electrodb";
import user from "./entities/user.js";
import userWorkspace from "./entities/userWorkspace.js";
import workspace from "./entities/workspace.js";
import gateway from "./entities/gateway.js";
import sensorData from "./entities/sensorData.js";
import sensorDataLatest from "./entities/sensorDataLatest.js";
import alert from "./entities/alert.js";
import wether from "./entities/wether.js";

type UserItem = EntityItem<typeof user>;
type UserWorkspaceItem = EntityItem<typeof userWorkspace>;
type WorkspaceItem = EntityItem<typeof workspace>;
type GatewayItem = EntityItem<typeof gateway>;
type SensorDataItem = EntityItem<typeof sensorData>;

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
    sensorData,
    sensorDataLatest,
    alert,
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
    gatewayId: string,
    userId: string,
  ) => {
    await service.entities.gateway
      .patch({ gatewayId })
      .set({ workspaceId, registeredBy: userId })
      .go();
  },

  get: async (
    workspaceId: string,
  ): Promise<{
    workspace: WorkspaceItem;
    gateways: GatewayItem[];
  }> => {
    const { data } = await service.collections.workspace({ workspaceId }).go();

    if (data.workspace.length === 0) {
      throw new Error(`workspace not found: ${workspaceId}`);
    }
    if (data.workspace.length > 1) {
      throw new Error(`workspace is not unique: ${workspaceId}`);
    }

    return {
      workspace: data.workspace[0],
      gateways: data.gateway,
    };
  },
};

export const Gateway = {
  create: async (imei: string, gatewayName: string): Promise<GatewayItem> => {
    const uuid = randomUUID();
    const res = await service.entities.gateway
      .create({
        gatewayId: `gw-${uuid}`,
        imei: imei,
        name: gatewayName,
        registrationCode: "test", // TODO: should adding feature to consume registration code
        sensorUnits: [...Array(6)].map((_, i) => ({
          sensorUnitId: `su-${uuid}-${i + 1}`,
          name: `sensor unit ${i + 1}`,
        })),
      })
      .go();

    return res.data;
  },

  createSensorData: async (props: {
    gatewayId: string;
    sensorUnitId: string;
    timestamp: Temporal.ZonedDateTime;
    temperature: number;
  }): Promise<void> => {
    const data = {
      ...props,
      timestamp: props.timestamp.toString(),
    };
    await service.transaction
      .write(({ sensorData, sensorDataLatest }) => [
        sensorData.create(data).commit(),
        sensorDataLatest.create(data).commit(),
      ])
      .go();
  },

  get: async (
    gatewayId: string,
  ): Promise<{ gateway: GatewayItem; sensorDataList: SensorDataItem[] }> => {
    const { data } = await service.collections.gateway({ gatewayId }).go();

    if (data.gateway.length === 0) {
      throw new Error(`gateway not found: ${gatewayId}`);
    }
    if (data.gateway.length > 1) {
      throw new Error(
        `gateway is not unique: ${gatewayId}, length ${data.gateway.length}`,
      );
    }

    return { gateway: data.gateway[0], sensorDataList: data.sensorDataLatest };
  },
};
