import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "alertCurrent",
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
    byGateway: {
      pk: { field: "pk", composite: ["workspaceId"] },
      sk: {
        field: "sk",
        composite: ["gatewayId", "sensorUnitId", "alertType", "occurredAt"],
      },
    },
  },
});
