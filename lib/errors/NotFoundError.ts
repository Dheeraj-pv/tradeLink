import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";

export class NotFoundError extends AppError {
  constructor(code: ErrorCode) {
    super(404, code);
  }
}