export type MyError = SystemError | BadRequestError | NotFoundError;

export type SystemError = {
  name: "SystemError";
  error: unknown;
};

export type BadRequestError = {
  name: "BadRequestError";
  payload: unknown;
};

export type NotFoundError = {
  name: "NotFoundError";
  resourceName: string;
  payload: unknown;
};
