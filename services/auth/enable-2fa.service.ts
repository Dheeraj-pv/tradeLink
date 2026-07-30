import { authenticator } from "otplib";
import { decrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { generateBackupCodes } from "@/lib/auth/backup-codes";
import * as authRepository from "@/repositories/auth/auth.repository";
import { ValidationError } from "@/lib/errors/ValidationError";
import { withSpan } from "@/lib/tracing";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function enableTwoFactor(code: string): Promise<string[]> {
  return withSpan("Enable Two-Factor Authentication", async (span) => {
    const currentUser = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", currentUser.id);

    const user = await withSpan("Load 2FA Secret", async () => {
      return authRepository.getTwoFactorSecret(currentUser.id);
    });

    if (!user?.twoFactorSecret) {
      span.setAttribute("failure.reason", "no_pending_setup");

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }
    const secret = user.twoFactorSecret;

    const isValid = await withSpan("Verify TOTP Code", async () => {
      return authenticator.verify({
        token: code,
        secret: decrypt(secret),
      });
    });

    if (!isValid) {
      span.setAttribute("failure.reason", "invalid_totp");

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const backupCodes = generateBackupCodes();

    await withSpan("Enable 2FA", async (txSpan) => {
      txSpan.setAttribute("backup_codes.count", backupCodes.length);

      await authRepository.enableTwoFactor(currentUser.id, backupCodes);
    });

    span.setAttribute("two_factor.enabled", true);

    return backupCodes;
  });
}
