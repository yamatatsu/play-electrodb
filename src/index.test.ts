import { test, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { Temporal } from "@js-temporal/polyfill";
import {
  UserTable,
  Workspace,
  GatewayTable,
  Alert,
  SensorUnit,
} from "./db/index.js";
import NT from "neverthrow";

const expectUserId = expect.stringMatching(/^test-userId-/);
const expectWorkspaceId = expect.stringMatching(/^ws-/);
const expectGatewayId = expect.stringMatching(/^gw-/);
const expectSensorUnitId = expect.stringMatching(/^su-.*-[0-9]$/);
const expectZonedDateTime = expect.stringMatching(
  /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+\+09:00\[Asia\/Tokyo\]/,
);

test("show pages after logged in", async () => {
  // GIVEN

  // manufacture a gateway
  const gateway = (
    await GatewayTable.create("test-imei", "test-gatewayName")
  )._unsafeUnwrap();
  await GatewayTable.createSensorData({
    gatewayId: gateway.gatewayId,
    sensorUnitIndex: 0,
    timestamp: Temporal.Now.zonedDateTimeISO(),
    temperature: 0,
    attached: false,
  });

  // create an user and a workspace, and attach the gateway to the workspace
  const user = await UserTable.create(
    `test-userId-${randomUUID()}`,
    "test-email",
  );
  const { workspaceId } = await Workspace.createAndAttachUser(
    "test-workspaceName",
    user.userId,
  );
  await Workspace.attachGateway(workspaceId, gateway, user.userId);

  // WHEN - THEN

  // GET /workspaces/${workspaceId}
  const resWorkspace = await Workspace.get(workspaceId);
  expect(resWorkspace).toEqual({
    workspaceId,
    name: "test-workspaceName",
    createdBy: user.userId,
    createdAt: expectZonedDateTime,
    updatedAt: expectZonedDateTime,
  });
});

test("show list of gateways", async () => {
  // GIVEN

  // manufacture a gateway and send test sensor data
  const gateway = (
    await GatewayTable.create("test-imei", "test-gatewayName")
  )._unsafeUnwrap();
  await GatewayTable.createSensorData({
    gatewayId: gateway.gatewayId,
    sensorUnitIndex: 0,
    timestamp: Temporal.Now.zonedDateTimeISO(),
    temperature: 0,
    attached: false,
  });

  // create an user and a workspace, and attach the gateway to the workspace
  const user = await UserTable.create(
    `test-userId-${randomUUID()}`,
    "test-email",
  );
  const workspace = await Workspace.createAndAttachUser(
    "test-workspaceName",
    user.userId,
  );
  await Workspace.attachGateway(workspace.workspaceId, gateway, user.userId);

  // send sensor data
  await GatewayTable.createSensorData({
    gatewayId: gateway.gatewayId,
    sensorUnitIndex: 1,
    timestamp: Temporal.Now.zonedDateTimeISO(),
    temperature: 1,
    attached: true,
  });

  // WHEN - THEN

  // GET /workspaces/${workspaceId}/gateways
  const resGateways = await GatewayTable.listByWorkspace(workspace);
  expect(resGateways).toEqual([
    {
      gatewayId: gateway.gatewayId,
      imei: "test-imei",
      name: "test-gatewayName",
      registrationCode: "test",
      registrationStatus: "unregistered",
      sensorUnits: [
        { name: "sensor unit 1", sensorUnitId: expectSensorUnitId },
        { name: "sensor unit 2", sensorUnitId: expectSensorUnitId },
        { name: "sensor unit 3", sensorUnitId: expectSensorUnitId },
        { name: "sensor unit 4", sensorUnitId: expectSensorUnitId },
        { name: "sensor unit 5", sensorUnitId: expectSensorUnitId },
        { name: "sensor unit 6", sensorUnitId: expectSensorUnitId },
      ],
      createdAt: expectZonedDateTime,
      updatedAt: expectZonedDateTime,
      workspaceId: expectWorkspaceId,
      attachedBy: expectUserId,
    },
  ]);

  // GET /workspaces/${workspaceId}/gateways/${gatewayId}
  const resGateway = await GatewayTable.get(gateway.gatewayId);
  expect(resGateway).toEqual({
    gateway: resGateways[0],
    sensorDataList: [
      {
        gatewayId: expectGatewayId,
        sensorUnitId: expectSensorUnitId,
        timestamp: expectZonedDateTime,
        temperature: 1,
      },
    ],
  });
});

test("show list of alerts", async () => {
  // GIVEN

  // manufacture a gateway and send test sensor data
  const gateway = await GatewayTable.create("test-imei", "test-gatewayName");

  // create an user and a workspace, and attach the gateway to the workspace
  const user = await UserTable.create(
    `test-userId-${randomUUID()}`,
    "test-email",
  );
  const { workspaceId } = await Workspace.createAndAttachUser(
    "test-workspaceName",
    user.userId,
  );
  await Workspace.attachGateway(workspaceId, gateway.gatewayId, user.userId);

  //
  SensorUnit.putAlertThreshold({
    workspaceId,
    gatewayId: gateway.gatewayId,
    sensorUnitIndex: 0,
    temperature: 0,
  });

  // send sensor data
  await GatewayTable.createSensorData({
    gatewayId: gateway.gatewayId,
    sensorUnitIndex: 1,
    timestamp: Temporal.Now.zonedDateTimeISO(),
    temperature: 1,
    attached: true,
  });

  // WHEN - THEN

  // GET /workspaces/${workspaceId}/alerts
  const resAlerts = await Alert.listByWorkspaceId(workspaceId);
  expect(resAlerts).toEqual(undefined);
});
