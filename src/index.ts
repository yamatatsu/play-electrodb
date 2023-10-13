import { Service } from "electrodb";
import { employee } from "./Employee";
import { task } from "./Task";
import { office } from "./Office";

export const taskManager = new Service({
  employee,
  task,
  office,
});
