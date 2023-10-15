import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "workspace",
    version: "1",
    service: "main",
  },
  attributes: {
    workspaceId: { type: "string", required: true },
    name: { type: "string", required: true },
    createdBy: { type: "string", required: true },
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
      pk: { field: "pk", composite: ["workspaceId"] },
      sk: { field: "sk", composite: [] },
    },
    withGateways: {
      collection: "workspace",
      index: "gsi1pk-gsi1sk-index",
      pk: { field: "gsi1pk", composite: ["workspaceId"] },
      sk: { field: "gsi1sk", composite: [] },
    },
  },
});
