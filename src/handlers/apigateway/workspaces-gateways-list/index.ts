import zod from "zod";
import { Workspace, Gateway } from "../../../db/index.js";
import wrap from "../common/wrapper.js";
import { parsePathParameters } from "../common/event-util.js";

const paramsSchema = zod.object({
  workspaceId: zod.string(),
});

export const handler = wrap((event) =>
  parsePathParameters(event, paramsSchema)
    .asyncAndThen((params) => Workspace.get(params.workspaceId))
    .andThen((workspace) => Gateway.listByWorkspace(workspace)),
);
