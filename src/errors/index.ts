export type MyError = SystemError | NotFoundError;

class BaseError extends Error {
  payload?: Record<string, unknown>;
  constructor(message: string, payload?: Record<string, unknown>) {
    super(message, { cause: payload });
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.payload = payload;
  }
}

export class SystemError extends BaseError {
  constructor(error: unknown) {
    super("Internal Server Error", { error });
  }
}

export class BadRequestError extends BaseError {
  constructor(payload?: Record<string, unknown>) {
    super("Bad Request", { ...payload });
  }
}

export class NotFoundError extends BaseError {
  constructor(resourceName: string, payload?: Record<string, unknown>) {
    super("Not Found", { ...payload, resourceName });
  }
}
