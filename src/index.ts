import { Service } from "electrodb";
import { employee } from "./Employee.js";
import { task } from "./Task.js";
import { office } from "./Office.js";

export const taskManager = new Service({
  employee,
  task,
  office,
});
