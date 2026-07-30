import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";

export class ConflictError extends AppError {
  constructor(code: ErrorCode) {
    super(409, code);
  }
}
