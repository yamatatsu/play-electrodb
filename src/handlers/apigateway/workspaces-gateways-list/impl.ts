import type { APIGatewayProxyEvent } from "aws-lambda";
import zod from "zod";
import { Workspace, GatewayTable } from "../../../db/index.js";
import { parsePathParameters } from "../common/event-util.js";

const paramsSchema = zod.object({
  workspaceId: zod.string(),
});

export default (event: Pick<APIGatewayProxyEvent, "pathParameters">) =>
  parsePathParameters(event, paramsSchema)
    .asyncAndThen((params) => Workspace.get(params.workspaceId))
    .andThen((workspace) => GatewayTable.listByWorkspace(workspace));
