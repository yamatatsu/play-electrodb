import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";
import { table, client } from "./common/index.js";

export default new Entity(
  {
    model: {
      entity: "sensorData",
      version: "1",
      service: "main",
    },
    attributes: {
      gatewayId: { type: "string", required: true },
      workspaceId: { type: "string" },
      physicalId: { type: "string", required: true },
      registrationCode: { type: "string", required: true },
      imsi: { type: "string" },
      simId: { type: "string" },
      name: { type: "string", required: true },
      registrationStatus: {
        type: "string",
        required: true,
        default: "unregistered",
      },
      sensorUnits: {
        type: "list",
        required: true,
        items: {
          type: "map",
          properties: {
            sensorUnitId: { type: "string", required: true },
            name: { type: "string", required: true },
            observeMode: {
              type: [
                "temperatureHumidityObserve",
                "condensationObserve",
                "connectorTemperatureObserve",
              ] as const,
              required: true,
            },
            macAddress: { type: "string", required: true },
          },
        },
      },
      createdHow: { type: "string", required: true },
      createdBy: { type: "string", required: true },
      createdAt: {
        type: "string",
        readOnly: true,
        required: true,
        default: () => Temporal.Now.zonedDateTimeISO().toString(),
        set: () => Temporal.Now.zonedDateTimeISO().toString(),
      },
    },
    indexes: {
      gateway: {
        pk: { field: "pk", composite: ["gatewayId"] },
        sk: { field: "sk", composite: [] },
      },
      workspace: {
        index: "gsi1pk-gsi1sk-index",
        pk: { field: "gsi1pk", composite: ["workspaceId"] },
        sk: { field: "gsi1sk", composite: ["createdAt"] },
      },
      physicalId: {
        index: "gsi2pk-gsi2sk-index",
        pk: { field: "gsi2pk", composite: ["physicalId"] },
        sk: { field: "gsi2sk", composite: [] },
      },
      registrationCode: {
        index: "gsi3pk-gsi3sk-index",
        pk: { field: "gsi3pk", composite: ["registrationCode"] },
        sk: { field: "gsi3sk", composite: ["registrationStatus"] },
      },
    },
  },
  { table, client },
);
