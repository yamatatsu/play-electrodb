import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "alertThreshold",
    version: "1",
    service: "main",
  },
  attributes: {
    workspaceId: { type: "string", required: true },
    gatewayId: { type: "string", required: true },
    sensorUnitId: { type: "string", required: true },
    temperature: { type: "number", required: true },
    createdAt: {
      type: "string",
      readOnly: true,
      required: true,
      default: () => Temporal.Now.zonedDateTimeISO().toString(),
      set: () => Temporal.Now.zonedDateTimeISO().toString(),
    },
    updatedAt: {
      type: "string",
      watch: "*",
      required: true,
      default: () => Temporal.Now.zonedDateTimeISO().toString(),
      set: () => Temporal.Now.zonedDateTimeISO().toString(),
    },
  },
  indexes: {
    sensorUnit: {
      pk: { field: "pk", composite: ["workspaceId"] },
      sk: { field: "sk", composite: ["gatewayId", "sensorUnitId"] },
    },
  },
});
