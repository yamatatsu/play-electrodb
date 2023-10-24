import type { APIGatewayProxyEvent } from "aws-lambda";
import zod from "zod";
import NT from "neverthrow";
import { BadRequestError } from "../../../errors/index.js";

export function parsePathParameters<Schema extends zod.ZodType<any, any, any>>(
  event: Pick<APIGatewayProxyEvent, "pathParameters">,
  schema: Schema,
): NT.Result<zod.infer<Schema>, BadRequestError> {
  return safeZodParse(event.pathParameters, schema);
}

export function parseQueryStringParameters<
  Schema extends zod.ZodType<any, any, any>,
>(
  event: Pick<APIGatewayProxyEvent, "queryStringParameters">,
  schema: Schema,
): NT.Result<zod.infer<Schema>, BadRequestError> {
  return safeZodParse(event.queryStringParameters, schema);
}

export function parseBody<Schema extends zod.ZodType<any, any, any>>(
  event: Pick<APIGatewayProxyEvent, "body">,
  schema: Schema,
): NT.Result<zod.infer<Schema>, BadRequestError> {
  return safeJSONPerse(event.body || "{}").andThen((body) =>
    safeZodParse(body, schema),
  );
}

const safeJSONPerse = NT.fromThrowable(
  JSON.parse,
  (error) => new BadRequestError({ error }),
);

function safeZodParse(value: unknown, schema: zod.ZodType<any, any, any>) {
  const result = schema.safeParse(value);
  if (result.success) {
    return NT.ok(result.data);
  } else {
    return NT.err(new BadRequestError({ cause: result.error }));
  }
}
