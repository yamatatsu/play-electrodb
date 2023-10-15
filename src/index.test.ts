import { randomUUID } from "node:crypto";
import { Temporal } from "@js-temporal/polyfill";
import { User, Workspace, Gateway } from "./db/index.js";

const expectUserId = expect.stringMatching(/^test-userId-/);
const expectWorkspaceId = expect.stringMatching(/^ws-/);
const expectGatewayId = expect.stringMatching(/^gw-/);
const expectSensorUnitId = expect.stringMatching(/^su-.*-[0-9]$/);
const expectZonedDateTime = expect.stringMatching(
  /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+\+09:00\[Asia\/Tokyo\]/,
);

test("test", async () => {
  // GIVEN

  // manufacture a gateway and send test sensor data
  const gateway = await Gateway.create("test-imei", "test-gatewayName");
  await Gateway.createSensorData({
    gatewayId: gateway.gatewayId,
    sensorUnitId: gateway.sensorUnits[0].sensorUnitId,
    timestamp: Temporal.Now.zonedDateTimeISO(),
    temperature: 0,
  });

  // create an user and a workspace, and attach the gateway to the workspace
  const user = await User.create(`test-userId-${randomUUID()}`, "test-email");
  const { workspaceId } = await Workspace.createAndAttachUser(
    "test-workspaceName",
    user.userId,
  );
  await Workspace.attachGateway(workspaceId, gateway.gatewayId, user.userId);

  // send sensor data
  await Gateway.createSensorData({
    gatewayId: gateway.gatewayId,
    sensorUnitId: gateway.sensorUnits[1].sensorUnitId,
    timestamp: Temporal.Now.zonedDateTimeISO(),
    temperature: 1,
  });

  // WHEN
  const resWorkspace = await Workspace.get(workspaceId);
  const resGateway = await Gateway.get(gateway.gatewayId);

  // THEN
  expect(resWorkspace).toEqual({
    workspace: {
      workspaceId,
      name: "test-workspaceName",
      createdBy: user.userId,
      createdAt: expectZonedDateTime,
      updatedAt: expectZonedDateTime,
    },
    gateways: [
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
        registeredBy: expectUserId,
      },
    ],
  });
  expect(resGateway).toEqual({
    gateway: resWorkspace.gateways[0],
    sensorDataList: [
      {
        gatewayId: expectGatewayId,
        sensorUnitId: expectSensorUnitId,
        timestamp: expectZonedDateTime,
        temperature: 0,
      },
      {
        gatewayId: expectGatewayId,
        sensorUnitId: expectSensorUnitId,
        timestamp: expectZonedDateTime,
        temperature: 1,
      },
    ],
  });
});
