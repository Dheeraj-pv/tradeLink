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

export async function resetPassword({
  token,
  password,
  totpCode,
  isBackupCode = false,
}: ResetPasswordInput): Promise<ResetPasswordResult> {
  return withSpan("Reset Password", async (span) => {
    span.setAttribute("auth.method", isBackupCode ? "backup_code" : "totp");

    const resetToken = await withSpan("Load Password Reset Token", async () => {
      return authRepository.findPasswordResetToken(hashToken(token));
    });

    if (!resetToken) {
      span.setAttribute("failure.reason", "invalid_reset_token");

      throw new NotFoundError(ErrorCode.INVALID_RESET_LINK);
    }

    span.setAttribute("user.id", resetToken.userId);
    span.setAttribute("auth.2fa_enabled", resetToken.user.twoFactorEnabled);

    if (resetToken.expiresAt < new Date()) {
      span.setAttribute("failure.reason", "expired_reset_token");

      await withSpan("Delete Expired Reset Token", async () => {
        await authRepository.deletePasswordResetToken(resetToken.id);
      });

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    if (resetToken.user.twoFactorEnabled) {
      if (!totpCode) {
        return {
          requiresTwoFactor: true,
        };
      }

      const secret = resetToken.user.twoFactorSecret;

      if (!secret) {
        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      const valid = await withSpan("Verify Authentication Code", async () => {
        if (isBackupCode) {
          return verifyBackupCode(resetToken.userId, totpCode);
        }

        return authenticator.verify({
          token: totpCode,
          secret: decrypt(secret),
        });
      });

      if (!valid) {
        span.setAttribute("failure.reason", "invalid_2fa_code");

        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }
    }

    const hashedPassword = await withSpan("Hash Password", async () => {
      return hashPassword(password);
    });

    await withSpan("Update Password", async () => {
      await authRepository.resetPassword(resetToken.userId, hashedPassword);
    });

    return {
      requiresTwoFactor: false,
    };
  });
}

export async function validateResetToken(
  token: string,
): Promise<ValidateResetTokenResult> {
  return withSpan("Validate Password Reset Token", async (span) => {
    const resetToken = await withSpan("Load Password Reset Token", async () => {
      return authRepository.validatePasswordResetToken(hashToken(token));
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      span.setAttribute("failure.reason", "invalid_or_expired_token");

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    return {
      valid: true,
      requiresTwoFactor: resetToken.user.twoFactorEnabled,
    };
  });
}
