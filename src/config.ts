import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const table = "electro";
export const client = new DynamoDBClient({
  endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
  region: "local",
});
