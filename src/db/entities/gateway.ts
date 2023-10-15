import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "gateway",
    version: "1",
    service: "main",
  },
  attributes: {
    gatewayId: { type: "string", required: true },
    imei: { type: "string", required: true },
    registrationCode: { type: "string", required: true },
    name: { type: "string", required: true },
    registrationStatus: {
      type: ["unregistered", "registered"] as const,
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
        },
      },
    },

    // on registered
    workspaceId: { type: "string" },
    registeredBy: { type: "string" },
    registeredAt: {
      type: "string",
      validate: (value: string) => {
        value && Temporal.ZonedDateTime.from(value);
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
    gateway: {
      collection: "gateway",
      pk: { field: "pk", composite: ["gatewayId"] },
      sk: { field: "sk", composite: [] },
    },
    workspace: {
      collection: "workspace",
      index: "gsi1pk-gsi1sk-index",
      pk: { field: "gsi1pk", composite: ["workspaceId"] },
      sk: { field: "gsi1sk", composite: [] },
    },
    imei: {
      index: "gsi2pk-gsi2sk-index",
      pk: { field: "gsi2pk", composite: ["imei"] },
      sk: { field: "gsi2sk", composite: [] },
    },
    registrationCode: {
      index: "gsi3pk-gsi3sk-index",
      pk: { field: "gsi3pk", composite: ["registrationCode"] },
      sk: { field: "gsi3sk", composite: ["registrationStatus"] },
    },
  },
});
