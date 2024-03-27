import { Temporal } from "@js-temporal/polyfill";

export type SensorData = {
  gatewayId: string;
  sensorUnitIndex: number;
  timestamp: Temporal.ZonedDateTime;
  temperature: number;
};
