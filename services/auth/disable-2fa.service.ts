// services/auth/disable-2fa.service.ts
import { authenticator } from "otplib";
import { decrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { verifyBackupCode } from "@/lib/auth/backup-codes";
import * as authRepository from "@/repositories/auth/auth.repository";
import { ValidationError } from "@/lib/errors/ValidationError";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { withSpan } from "@/lib/tracing";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
interface DisableTwoFactorInput {
  code: string;
  isBackupCode?: boolean;
}

/**
 * Disable Two-Factor Authentication Service
 * Disables 2FA after verifying the provided code
 */
export async function disableTwoFactor({
  code,
  isBackupCode = false,
}: DisableTwoFactorInput): Promise<void> {
  return withSpan("DisableTwoFactorService", async (span) => {
    // 1. Get current user
    const currentUser = await withSpan("AuthenticateUser", async () => {
      const user = await getCurrentUser();
      if (!user) {
        throw new AuthenticationError(ErrorCode.INVALID_TOKEN);
      }
      return user;
    });

    logger.info("Disable 2FA request", {
      userId: currentUser.id,
      email: currentUser.email,
      isBackupCode,
    });

    span.setAttribute("user.id", currentUser.id);
    span.setAttribute("auth.method", isBackupCode ? "backup_code" : "totp");

    // 2. Load 2FA settings
    const user = await withSpan("LoadTwoFactorSettings", async () => {
      return authRepository.getTwoFactorSettings(currentUser.id);
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      logger.warn("Disable 2FA failed: 2FA not enabled", {
        userId: currentUser.id,
      });
      span.setAttribute("failure.reason", "2fa_not_enabled");
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    // 3. Verify the code
    const secret = user.twoFactorSecret;

    const valid = await withSpan("VerifyAuthenticationCode", async () => {
      if (isBackupCode) {
        return verifyBackupCode(currentUser.id, code);
      }

      try {
        return authenticator.verify({
          token: code,
          secret: decrypt(secret),
        });
      } catch (error) {
        logger.error("TOTP verification error", {
          userId: currentUser.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return false;
      }
    });

    if (!valid) {
      logger.warn("Disable 2FA failed: Invalid code", {
        userId: currentUser.id,
        isBackupCode,
      });
      span.setAttribute("failure.reason", "invalid_code");
      throw new ValidationError(ErrorCode.INVALID_2FA_CODE);
    }

    // 4. Disable 2FA
    await withSpan("DisableTwoFactorInDatabase", async (txSpan) => {
      txSpan.setAttribute("backup_codes.deleted", true);
      await authRepository.disableTwoFactor(currentUser.id);
    });

    logger.info("2FA disabled successfully", {
      userId: currentUser.id,
      email: currentUser.email,
    });

    span.setAttribute("two_factor.enabled", false);
  });
}