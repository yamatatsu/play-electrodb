import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "gatewayPreAttached",
    version: "1",
    service: "main",
  },
  attributes: {
    registrationCode: { type: "string", required: true },
    gatewayId: { type: "string", required: true },
    imei: { type: "string", required: true },
    name: { type: "string", required: true },
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
    registrationCode: {
      collection: "registrationCode",
      pk: { field: "pk", composite: ["registrationCode"] },
      sk: { field: "sk", composite: [] },
    },
  },
});
