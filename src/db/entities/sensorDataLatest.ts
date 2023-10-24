import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "sensorDataLatest",
    version: "1",
    service: "main",
  },
  attributes: {
    workspaceId: { type: "string", required: true },
    gatewayId: { type: "string", required: true },
    sensorUnitIndex: { type: "number", required: true },
    timestamp: {
      type: "string",
      required: true,
      validate: (date: string) => {
        date && Temporal.ZonedDateTime.from(date);
      },
    },
    temperature: { type: "number", required: true },
  },
  indexes: {
    sensorData: {
      collection: "gateway",
      pk: { field: "pk", composite: ["workspaceId"] },
      sk: { field: "sk", composite: ["gatewayId", "sensorUnitIndex"] },
    },
  },
});
