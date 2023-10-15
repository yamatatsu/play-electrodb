import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "alert",
    version: "1",
    service: "main",
  },
  attributes: {
    workspaceId: { type: "string", required: true },
    gatewayId: { type: "string", required: true },
    sensorUnitId: { type: "string", required: true },
    alertType: {
      type: ["temperature"] as const,
      required: true,
    },
    occurredAt: {
      type: "string",
      required: true,
      validate: (date: string) => {
        date && Temporal.ZonedDateTime.from(date);
      },
    },
    status: {
      type: ["occurring"] as const,
      required: true,
    },
    occurred: {
      type: "map",
      required: true,
      properties: {
        gatewayName: { type: "string", required: true },
        sensorUnitName: { type: "string", required: true },
        value: { type: "number", required: true },
        upperThreshold: { type: "number" },
        lowerThreshold: { type: "number" },
        reason: {
          type: ["upper", "lower"] as const,
          required: true,
        },
      },
    },
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
    history: {
      pk: { field: "pk", composite: ["workspaceId"] },
      sk: { field: "sk", composite: ["occurredAt"] },
    },
    device: {
      index: "gsi1pk-gsi1sk-index",
      pk: { field: "gsi1pk", composite: ["gatewayId"] },
      sk: {
        field: "gsi1sk",
        composite: ["sensorUnitId", "alertType", "occurredAt"],
      },
    },
    status: {
      index: "gsi2pk-gsi2sk-index",
      pk: { field: "gsi2pk", composite: ["workspaceId"] },
      sk: { field: "gsi3sk", composite: ["gatewayId", "status"] },
    },
  },
});
