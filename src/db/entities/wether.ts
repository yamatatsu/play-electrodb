import { Temporal } from "@js-temporal/polyfill";
import { Entity } from "electrodb";

export default new Entity({
  model: {
    entity: "wether",
    version: "1",
    service: "main",
  },
  attributes: {
    areaId: { type: "string", required: true },
    date: {
      type: "string",
      required: true,
      validate: (date: string) => {
        date && Temporal.PlainDate.from(date);
      },
    },
    pinpointCode: { type: "string", required: true },
    icon: { type: "string", required: true },
    rainQuantity: { type: "number", required: true },
    temperatureMax: { type: "number", required: true },
    temperatureMin: { type: "number", required: true },
    weatherCode: { type: "string", required: true },
    weatherName: { type: "string", required: true },
  },
  indexes: {
    wether: {
      pk: { field: "pk", composite: ["areaId"] },
      sk: { field: "sk", composite: ["date"] },
    },
  },
});
