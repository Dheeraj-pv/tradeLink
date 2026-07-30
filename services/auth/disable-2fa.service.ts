import { authenticator } from "otplib";
import { decrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { verifyBackupCode } from "@/lib/auth/backup-codes";
import * as authRepository from "@/repositories/auth/auth.repository";
import { ValidationError } from "@/lib/errors/ValidationError";
import { withSpan } from "@/lib/tracing";
import { ErrorCode } from "@/lib/errors/ErrorCode";

interface DisableTwoFactorInput {
  code: string;
  isBackupCode?: boolean;
}

export async function disableTwoFactor({
  code,
  isBackupCode = false,
}: DisableTwoFactorInput): Promise<void> {
  return withSpan("Disable Two-Factor Authentication", async (span) => {
    const currentUser = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", currentUser.id);
    span.setAttribute("auth.method", isBackupCode ? "backup_code" : "totp");

    const user = await withSpan("Load 2FA Settings", async () => {
      return authRepository.getTwoFactorSettings(currentUser.id);
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      span.setAttribute("failure.reason", "2fa_not_enabled");

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const secret = user.twoFactorSecret;

    const valid = await withSpan("Verify Authentication Code", async () => {
      if (isBackupCode) {
        return verifyBackupCode(currentUser.id, code);
      }

      return authenticator.verify({
        token: code,
        secret: decrypt(secret),
      });
    });

    if (!valid) {
      span.setAttribute("failure.reason", "invalid_code");

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    await withSpan("Disable 2FA", async (txSpan) => {
      txSpan.setAttribute("backup_codes.deleted", true);

      await authRepository.disableTwoFactor(currentUser.id);
    });

    span.setAttribute("two_factor.enabled", false);
  });
}
