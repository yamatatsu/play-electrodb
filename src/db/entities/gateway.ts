import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "gateway",
    version: "1",
    service: "main",
  },
  attributes: {
    workspaceId: { type: "string", required: true },
    gatewayId: { type: "string", required: true },
    imei: { type: "string", required: true },
    name: { type: "string", required: true },
    registrationCode: { type: "string", required: true },
    attachedBy: { type: "string", required: true },
    sensorUnits: {
      type: "list",
      required: true,
      items: {
        type: "map",
        properties: {
          name: { type: "string", required: true },
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
    byWorkspaceId: {
      collection: "gateway",
      pk: { field: "pk", composite: ["workspaceId"] },
      sk: { field: "sk", composite: ["gatewayId"] },
    },
    imei: {
      index: "gsi2pk-gsi2sk-index",
      pk: { field: "gsi2pk", composite: ["imei"] },
      sk: { field: "gsi2sk", composite: [] },
    },
  },
});
