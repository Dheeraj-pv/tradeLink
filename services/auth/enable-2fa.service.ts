// services/auth/enable-2fa.service.ts
import { authenticator } from "otplib";
import { decrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { generateBackupCodes } from "@/lib/auth/backup-codes";
import * as authRepository from "@/repositories/auth/auth.repository";
import { ValidationError } from "@/lib/errors/ValidationError";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { withSpan } from "@/lib/tracing";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

/**
 * Enable Two-Factor Authentication Service
 * Verifies TOTP code and enables 2FA for the current user
 */
export async function enableTwoFactor(code: string): Promise<string[]> {
  return withSpan("EnableTwoFactorService", async (span) => {
    // 1. Get current user
    const currentUser = await withSpan("AuthenticateUser", async () => {
      const user = await getCurrentUser();
      if (!user) {
        throw new AuthenticationError(ErrorCode.INVALID_TOKEN);
      }
      return user;
    });

    logger.info("Enable 2FA request", {
      userId: currentUser.id,
      email: currentUser.email,
    });

    span.setAttribute("user.id", currentUser.id);

    // 2. Load 2FA secret
    const user = await withSpan("LoadTwoFactorSecret", async () => {
      return authRepository.getTwoFactorSecret(currentUser.id);
    });

    if (!user?.twoFactorSecret) {
      logger.warn("Enable 2FA failed: No pending setup", {
        userId: currentUser.id,
      });
      span.setAttribute("failure.reason", "no_pending_setup");
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const secret = user.twoFactorSecret;

    // 3. Verify TOTP code
    const isValid = await withSpan("VerifyTOTPCode", async () => {
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

    if (!isValid) {
      logger.warn("Enable 2FA failed: Invalid TOTP code", {
        userId: currentUser.id,
      });
      span.setAttribute("failure.reason", "invalid_totp");
      throw new ValidationError(ErrorCode.INVALID_2FA_CODE);
    }

    // 4. Generate backup codes
    const backupCodes = generateBackupCodes();

    // 5. Enable 2FA
    await withSpan("EnableTwoFactorInDatabase", async (txSpan) => {
      txSpan.setAttribute("backup_codes.count", backupCodes.length);
      await authRepository.enableTwoFactor(currentUser.id, backupCodes);
    });

    logger.info("2FA enabled successfully", {
      userId: currentUser.id,
      email: currentUser.email,
      backupCodesCount: backupCodes.length,
    });

    span.setAttribute("two_factor.enabled", true);

    return backupCodes;
  });
}