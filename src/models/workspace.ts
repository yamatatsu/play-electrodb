import { randomUUID } from "node:crypto";
import { User } from "./user.js";

export type Workspace = {
  workspaceId: string;
  name: string;
  createdBy: string;
};

export function createWorkspace(name: string, createdBy: User): Workspace {
  const workspaceId = `ws-${randomUUID()}`;
  return { workspaceId, name, createdBy: createdBy.userId };
}
