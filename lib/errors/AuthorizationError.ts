import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";

export class AuthorizationError extends AppError {
  constructor(code: ErrorCode) {
    super(403, code);
  }
}
