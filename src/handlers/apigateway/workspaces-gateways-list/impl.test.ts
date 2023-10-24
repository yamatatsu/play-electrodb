import { test, expect } from "vitest";
import NT from "neverthrow";
import { Workspace, Gateway } from "../../../db/index.js";
import { BadRequestError, NotFoundError } from "../../../errors/index.js";
import impl from "./impl.js";

const expectZonedDateTime = expect.stringMatching(
  /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+\+09:00\[Asia\/Tokyo\]/,
);

test.each`
  event                                           | statusCode | error                    | body
  ${{}}                                           | ${400}     | ${new BadRequestError()} | ${'[{"code":"invalid_type","expected":"object","received":"undefined","path":[],"message":"Required"}]'}
  ${{ pathParameters: {} }}                       | ${400}     | ${new BadRequestError()} | ${'[{"code":"invalid_type","expected":"string","received":"undefined","path":["workspaceId"],"message":"Required"}]'}
  ${{ pathParameters: { workspaceId: "dummy" } }} | ${404}     | ${new NotFoundError("")} | ${'{"resourceName":"workspace"}'}
`("event :$event", async ({ event, statusCode, error, body }) => {
  // WHEN
  const result = await impl(event);

  // THEN
  expect(result).toEqual(NT.err(error));
});

test("empty gateways", async () => {
  // GIVEN
  const workspace = await Workspace.createAndAttachUser(
    "test workspace",
    "test-userId",
  );

  // WHEN
  const result = await impl({
    pathParameters: { workspaceId: workspace.workspaceId },
  });

  // THEN
  expect(result).toEqual(NT.ok([]));
});

test("list gateways", async () => {
  // GIVEN
  const ws = await Workspace.createAndAttachUser(
    "test workspace",
    "test-userId",
  );
  const gw1 = await Gateway.create("test-imei", "test-gateway");
  await Workspace.attachGateway(
    ws.workspaceId,
    gw1._unsafeUnwrap(),
    "test-userId",
  );

  // WHEN
  const result = await impl({
    pathParameters: { workspaceId: ws.workspaceId },
  });

  // THEN
  expect(result).toEqual(
    NT.ok([
      {
        workspaceId: ws.workspaceId,
        gatewayId: gw1._unsafeUnwrap().gatewayId,
        imei: "test-imei",
        name: "test-gateway",
        registrationCode: expect.stringMatching(/^A\d{5}$/),
        attachedBy: "test-userId",
        sensorUnits: [
          { name: "sensor unit 1" },
          { name: "sensor unit 2" },
          { name: "sensor unit 3" },
          { name: "sensor unit 4" },
          { name: "sensor unit 5" },
          { name: "sensor unit 6" },
        ],
        createdAt: expectZonedDateTime,
        updatedAt: expectZonedDateTime,
      },
    ]),
  );
});
