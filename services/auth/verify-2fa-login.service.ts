import { authenticator } from "otplib";
import { decrypt } from "@/lib/crypto";
import { verifyPendingToken, signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { verifyBackupCode } from "@/lib/auth/backup-codes";
import { findUserFor2FALogin } from "@/repositories/auth/auth.repository";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type Verify2FARequest = {
  pendingToken: string;
  code: string;
  isBackupCode?: boolean;
};

export async function verify2FALogin({
  pendingToken,
  code,
  isBackupCode,
}: Verify2FARequest) {
  const pending = await verifyPendingToken(pendingToken);

  if (!pending) {
    logger.warn("2FA verify failed: expired or invalid pending token");
    throw new AuthenticationError(
      ErrorCode.EXPIRED_TOKEN
    );
  }

  const user = await findUserFor2FALogin(
    pending.userId
  );

  if (!user?.twoFactorSecret) {
    logger.warn(
      { userId: pending.userId },
      "2FA verify failed: no secret configured"
    );

    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const valid = isBackupCode
    ? await verifyBackupCode(user.id, code)
    : authenticator.verify({
        token: code,
        secret: decrypt(user.twoFactorSecret),
      });

  if (!valid) {
    logger.warn(
      { userId: user.id },
      "2FA verify failed: invalid code"
    );

    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.userRole,
    passwordVersion: user.passwordVersion,
  });

  await setAuthCookie(token);

  logger.info(
    {
      userId: user.id,
      role: user.userRole,
    },
    "User logged in successfully (2FA)"
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.userRole,
  };
}