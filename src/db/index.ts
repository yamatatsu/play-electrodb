import { Service } from "electrodb";
import wether from "./wether.js";
import sensorData from "./sensorData.js";
import alert from "./alert.js";
import gateway from "./gateway.js";

export const service = new Service({
  wether,
  sensorData,
  alert,
  gateway,
});
