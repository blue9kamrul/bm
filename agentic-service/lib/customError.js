export class CustomError extends Error {
  constructor(message, statusCode = 500, errorType="INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }
}