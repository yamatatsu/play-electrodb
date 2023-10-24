import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "sensorData",
    version: "1",
    service: "main",
  },
  attributes: {
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
      pk: { field: "pk", composite: ["gatewayId"] },
      sk: { field: "sk", composite: ["sensorUnitIndex", "timestamp"] },
    },
  },
});
