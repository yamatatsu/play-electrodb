import type { APIGatewayProxyEvent } from "aws-lambda";
import { describe, test, expect } from "vitest";
import zod from "zod";
import NT from "neverthrow";
import { NotFoundError } from "../../../errors/index.js";
import wrap from "./wrapper.js";

describe.skip("parse event", () => {
  test("params success", async () => {
    // GIVEN
    const event = {
      pathParameters: { resourceId: "test-resourceId" },
    } as any as APIGatewayProxyEvent;
    const paramsSchema = zod.object({ resourceId: zod.string() });

    // WHEN
    const handler = wrap({
      paramsSchema,
      handler: ({ params }) => NT.okAsync(params),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 200,
      body: '{"resourceId":"test-resourceId"}',
    });
  });

  test("params error", async () => {
    // GIVEN
    const event = {
      pathParameters: {},
    } as any as APIGatewayProxyEvent;
    const paramsSchema = zod.object({ resourceId: zod.string() });

    // WHEN
    const handler = wrap({
      paramsSchema,
      handler: ({ params }) => NT.okAsync(params),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 400,
      body: '[{"code":"invalid_type","expected":"string","received":"undefined","path":["resourceId"],"message":"Required"}]',
    });
  });

  test("query success", async () => {
    // GIVEN
    const event = {
      queryStringParameters: { from: "2023-01-01", to: "2023-12-31" },
    } as any as APIGatewayProxyEvent;
    const querySchema = zod.object({ from: zod.string(), to: zod.string() });

    // WHEN
    const handler = wrap({
      querySchema,
      handler: ({ query }) => NT.okAsync(query),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 200,
      body: '{"from":"2023-01-01","to":"2023-12-31"}',
    });
  });

  test("query error", async () => {
    // GIVEN
    const event = {
      queryStringParameters: { from: "2023-01-01", to: 1 },
    } as any as APIGatewayProxyEvent;
    const querySchema = zod.object({ from: zod.string(), to: zod.string() });

    // WHEN
    const handler = wrap({
      querySchema,
      handler: ({ query }) => NT.okAsync(query),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 400,
      body: '[{"code":"invalid_type","expected":"string","received":"number","path":["to"],"message":"Expected string, received number"}]',
    });
  });

  test("body success", async () => {
    // GIVEN
    const event = {
      body: '{"count":1}',
    } as any as APIGatewayProxyEvent;
    const bodySchema = zod.object({ count: zod.number() });

    // WHEN
    const handler = wrap({
      bodySchema,
      handler: ({ body }) => NT.okAsync(body),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 200,
      body: '{"count":1}',
    });
  });

  test("body error", async () => {
    // GIVEN
    const event = {
      body: '{"count":null}',
    } as any as APIGatewayProxyEvent;
    const bodySchema = zod.object({ count: zod.number() });

    // WHEN
    const handler = wrap({
      bodySchema,
      handler: ({ body }) => NT.okAsync(body),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 400,
      body: '[{"code":"invalid_type","expected":"number","received":"null","path":["count"],"message":"Expected number, received null"}]',
    });
  });
  test("body error (not JSON)", async () => {
    // GIVEN
    const event = {
      body: "{{",
    } as any as APIGatewayProxyEvent;
    const bodySchema = zod.object({ count: zod.number() });

    // WHEN
    const handler = wrap({
      bodySchema,
      handler: ({ body }) => NT.okAsync(body),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 400,
      body: '{"message":"Unexpected token { in JSON at position 1"}',
    });
  });

  test("multiple error", async () => {
    // GIVEN
    const event = {
      pathParameters: {},
      queryStringParameters: { from: "2023-01-01", to: 1 },
      body: '{"count":null}',
    } as any as APIGatewayProxyEvent;
    const paramsSchema = zod.object({ resourceId: zod.string() });
    const querySchema = zod.object({ from: zod.string(), to: zod.string() });
    const bodySchema = zod.object({ count: zod.number() });

    // WHEN
    const handler = wrap({
      paramsSchema,
      querySchema,
      bodySchema,
      handler: ({ params, query, body }) => NT.okAsync({ params, query, body }),
    });
    const result = await handler(event);

    // THEN
    expect(result).toEqual({
      statusCode: 400,
      body: '[{"code":"invalid_type","expected":"string","received":"undefined","path":["resourceId"],"message":"Required"}]',
    });
  });
});

describe("response", () => {
  const event = {} as any;

  test("success", async () => {
    const handler = wrap(() => NT.okAsync({ result: "ok" }));

    const result = await handler(event);

    expect(result).toEqual({ statusCode: 200, body: '{"result":"ok"}' });
  });

  test("NotFound", async () => {
    const handler = wrap(() => NT.errAsync(new NotFoundError("user")));

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 404,
      body: '{"resourceName":"user"}',
    });
  });
});
