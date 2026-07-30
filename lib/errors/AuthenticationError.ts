import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";

export class AuthenticationError extends AppError {
  constructor(code: ErrorCode) {
    super(401, code);
  }
}
