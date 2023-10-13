import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { taskManager } from "./";
import { office } from "./Office";

const client = new DynamoDBClient({
  endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
  region: "local",
});
const doc = DynamoDBDocument.from(client);

describe("create", () => {
  test("with taskManager", async () => {
    await taskManager.entities.office
      .create({
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.", // This is optional because not a part of the composite primary key.
      })
      .go();

    const { Items: items } = await doc.scan({ TableName: "electro" });

    expect(items).toEqual([
      {
        pk: "$taskmanager#country_usa#state_wa",
        sk: "$office_1#city_seattle#zip_98101#office_hq",
        gsi1pk: "$taskmanager#office_hq",
        gsi1sk: "$workplaces#office_1",
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.",
        __edb_e__: "office",
        __edb_v__: "1",
      },
    ]);
  });

  test("with office entity", async () => {
    await office
      .create({
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.", // This is optional because not a part of the composite primary key.
      })
      .go();

    const { Items: items } = await doc.scan({ TableName: "electro" });

    expect(items).toEqual([
      {
        pk: "$taskmanager#country_usa#state_wa",
        sk: "$office_1#city_seattle#zip_98101#office_hq",
        gsi1pk: "$taskmanager#office_hq",
        gsi1sk: "$workplaces#office_1",
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.",
        __edb_e__: "office",
        __edb_v__: "1",
      },
    ]);
  });

  test("with office entity and no optional fields", async () => {
    await taskManager.entities.office
      .create({
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.", // This is optional because not a part of the composite primary key.
      })
      .go();

    const office = await taskManager.entities.office
      .get({
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
      })
      .go();

    const { Items: items } = await doc.scan({ TableName: "electro" });

    expect(items).toEqual([
      {
        pk: "$taskmanager#country_usa#state_wa",
        sk: "$office_1#city_seattle#zip_98101#office_hq",
        gsi1pk: "$taskmanager#office_hq",
        gsi1sk: "$workplaces#office_1",
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.",
        __edb_e__: "office",
        __edb_v__: "1",
      },
    ]);
  });
});

describe("collection", () => {
  test("with taskManager", async () => {
    await taskManager.entities.office
      .create({
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.", // This is optional because not a part of the composite primary key.
      })
      .go();
    // await taskManager.entities.employee
    //   .create({
    //     office: "HQ",
    //     country: "USA",
    //     state: "WA",
    //     city: "Seattle",
    //     zip: "98101",
    //     address: "123 Main St.", // This is optional because not a part of the composite primary key.
    //   })
    //   .go();

    const result = await taskManager.collections
      .workplaces({ office: "HQ" })
      .go();

    expect(result).toEqual([
      {
        pk: "$taskmanager#country_usa#state_wa",
        sk: "$office_1#city_seattle#zip_98101#office_hq",
        gsi1pk: "$taskmanager#office_hq",
        gsi1sk: "$workplaces#office_1",
        office: "HQ",
        country: "USA",
        state: "WA",
        city: "Seattle",
        zip: "98101",
        address: "123 Main St.",
        __edb_e__: "office",
        __edb_v__: "1",
      },
    ]);
  });
});
