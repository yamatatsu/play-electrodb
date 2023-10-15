import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "userWorkspace",
    version: "1",
    service: "main",
  },
  attributes: {
    userId: { type: "string", required: true },
    workspaceId: { type: "string", required: true },
    role: { type: ["normal", "admin"] as const, required: true },
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
    byUserId: {
      collection: "user",
      pk: { field: "pk", composite: ["userId"] },
      sk: { field: "sk", composite: ["workspaceId"] },
    },
  },
});
