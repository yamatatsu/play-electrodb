import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import NT from "neverthrow";
import { MyError } from "../../../errors/index.js";

export default (
    handler: (event: APIGatewayProxyEvent) => NT.ResultAsync<Object, MyError>,
  ) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const result = await handler(event);

    if (result.isOk()) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.value),
      };
    }

    switch (result.error.name) {
      case "SystemError":
        console.error(result.error);
        return {
          statusCode: 500,
          body: "Internal Server Error",
        };

      case "BadRequestError":
        console.info(result.error);
        return {
          statusCode: 400,
          body: JSON.stringify(result.error.payload),
        };

      case "NotFoundError":
        console.info(result.error);
        return {
          statusCode: 404,
          body: JSON.stringify(result.error.payload),
        };

      default:
        const ___: never = result.error;
        console.error(result.error);
        return {
          statusCode: 500,
          body: "Internal Server Error",
        };
    }
  };
