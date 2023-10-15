import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "sensorDataLatest",
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
  },
  indexes: {
    sensorData: {
      collection: "gateway",
      pk: { field: "pk", composite: ["gatewayId"] },
      sk: { field: "sk", composite: ["sensorUnitId"] },
    },
  },
});
