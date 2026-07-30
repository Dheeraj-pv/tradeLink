import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";

export class ValidationError extends AppError {
  constructor(code: ErrorCode) {
    super(400, code);
  }
}
