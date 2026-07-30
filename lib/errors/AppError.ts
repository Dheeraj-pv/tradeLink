import type { ErrorCode } from "./ErrorCode";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
  ) {
    super();
    this.name = this.constructor.name;
  }
}
