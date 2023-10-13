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
      sensorUnitId: { type: "string", required: true },
      timestamp: {
        type: "string",
        required: true,
        validate: (date: string) => {
          date && Temporal.ZonedDateTime.from(date);
        },
      },
      temperature: { type: "number", required: true },
      humidity: { type: "number", required: true },
      objectTemperature: { type: "number", required: true },
      dewTemperature: { type: "number", required: true },
      condensationAlertTemperature: { type: "number", required: true },
      battery: {
        type: ["empty", "low", "high", "full", "unknown"] as const,
        required: true,
      },
      powerSupply: {
        type: ["usb", "battery", "unknown"] as const,
        required: true,
      },
    },
    indexes: {
      sensorData: {
        pk: { field: "pk", composite: ["gatewayId"] },
        sk: { field: "sk", composite: ["sensorUnitId", "timestamp"] },
      },
    },
  },
  { table, client },
);
