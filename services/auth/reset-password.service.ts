// services/auth/reset-password.service.ts
import { authenticator } from "otplib";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/token";
import { decrypt } from "@/lib/crypto";
import { verifyBackupCode } from "@/lib/auth/backup-codes";
import { withSpan } from "@/lib/tracing";
import * as authRepository from "@/repositories/auth/auth.repository";
import { ValidationError } from "@/lib/errors/ValidationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
interface ResetPasswordInput {
  token: string;
  password: string;
  totpCode?: string;
  isBackupCode?: boolean;
}

interface ValidateResetTokenResult {
  valid: true;
  requiresTwoFactor: boolean;
}

interface ResetPasswordResult {
  requiresTwoFactor: boolean;
}

/**
 * Reset Password Service
 * Resets user password with optional 2FA verification
 */
export async function resetPassword({
  token,
  password,
  totpCode,
  isBackupCode = false,
}: ResetPasswordInput): Promise<ResetPasswordResult> {
  return withSpan("ResetPasswordService", async (span) => {
    span.setAttribute("auth.method", isBackupCode ? "backup_code" : "totp");

    logger.info("Reset password attempt", {
      hasToken: !!token,
      hasTotpCode: !!totpCode,
      isBackupCode,
    });

    // 1. Load password reset token
    const resetToken = await withSpan("LoadPasswordResetToken", async () => {
      return authRepository.findPasswordResetToken(hashToken(token));
    });

    if (!resetToken) {
      logger.warn("Reset password failed: Invalid reset token");
      span.setAttribute("failure.reason", "invalid_reset_token");
      throw new NotFoundError(ErrorCode.INVALID_RESET_LINK);
    }

    span.setAttribute("user.id", resetToken.userId);
    span.setAttribute("auth.2fa_enabled", resetToken.user.twoFactorEnabled);

    // 2. Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      logger.warn("Reset password failed: Expired reset token", {
        userId: resetToken.userId,
        expiresAt: resetToken.expiresAt,
      });
      span.setAttribute("failure.reason", "expired_reset_token");

      await withSpan("DeleteExpiredResetToken", async () => {
        await authRepository.deletePasswordResetToken(resetToken.id);
      });

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    // 3. Handle 2FA if enabled
    if (resetToken.user.twoFactorEnabled) {
      if (!totpCode) {
        logger.info("Reset password: 2FA required", {
          userId: resetToken.userId,
        });
        return {
          requiresTwoFactor: true,
        };
      }

      const secret = resetToken.user.twoFactorSecret;

      if (!secret) {
        logger.warn("Reset password failed: No 2FA secret found", {
          userId: resetToken.userId,
        });
        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      const valid = await withSpan("VerifyAuthenticationCode", async () => {
        if (isBackupCode) {
          return verifyBackupCode(resetToken.userId, totpCode);
        }

        try {
          return authenticator.verify({
            token: totpCode,
            secret: decrypt(secret),
          });
        } catch (error) {
          logger.error("TOTP verification error", {
            userId: resetToken.userId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return false;
        }
      });

      if (!valid) {
        logger.warn("Reset password failed: Invalid 2FA code", {
          userId: resetToken.userId,
          isBackupCode,
        });
        span.setAttribute("failure.reason", "invalid_2fa_code");
        throw new ValidationError(ErrorCode.INVALID_2FA_CODE);
      }
    }

    // 4. Hash new password
    const hashedPassword = await withSpan("HashPassword", async () => {
      return hashPassword(password);
    });

    // 5. Update password
    await withSpan("UpdatePassword", async () => {
      await authRepository.resetPassword(resetToken.userId, hashedPassword);
    });

    logger.info("Password reset successful", {
      userId: resetToken.userId,
    });

    return {
      requiresTwoFactor: false,
    };
  });
}

/**
 * Validate Reset Token Service
 * Validates a password reset token
 */
export async function validateResetToken(
  token: string,
): Promise<ValidateResetTokenResult> {
  return withSpan("ValidateResetTokenService", async (span) => {
    logger.info("Validate reset token request", {
      hasToken: !!token,
    });

    const resetToken = await withSpan("LoadPasswordResetToken", async () => {
      return authRepository.validatePasswordResetToken(hashToken(token));
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      logger.warn("Validate reset token failed: Invalid or expired token");
      span.setAttribute("failure.reason", "invalid_or_expired_token");
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    // The user is embedded in the resetToken, not as a separate property
    // validatePasswordResetToken returns: { expiresAt, user: { twoFactorEnabled } }
    const requiresTwoFactor = resetToken.user?.twoFactorEnabled || false;

    logger.info("Reset token validated successfully", {
      requiresTwoFactor,
    });

    return {
      valid: true,
      requiresTwoFactor,
    };
  });
}