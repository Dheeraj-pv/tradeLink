// services/auth/verify-2fa-login.service.ts
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
import { withSpan } from "@/lib/tracing";

// Type definitions
type Verify2FARequest = {
  pendingToken: string;
  code: string;
  isBackupCode?: boolean;
};

type Verify2FAResult = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "PROVIDER";
};

/**
 * Verify 2FA Login Service
 * Verifies the 2FA code and completes the login process
 */
export async function verify2FALogin({
  pendingToken,
  code,
  isBackupCode = false,
}: Verify2FARequest): Promise<Verify2FAResult> {
  return withSpan("Verify2FALoginService", async (span) => {
    span.setAttribute("auth.method", isBackupCode ? "backup_code" : "totp");

    logger.info("2FA verification attempt", {
      hasPendingToken: !!pendingToken,
      hasCode: !!code,
      isBackupCode,
    });

    // 1. Verify pending token
    const pending = await withSpan("VerifyPendingToken", async () => {
      return verifyPendingToken(pendingToken);
    });

    if (!pending) {
      logger.warn("2FA verify failed: Expired or invalid pending token");
      span.setAttribute("failure.reason", "invalid_pending_token");
      throw new AuthenticationError(ErrorCode.EXPIRED_TOKEN);
    }

    span.setAttribute("user.id", pending.userId);

    // 2. Load user
    const user = await withSpan("LoadUser", async () => {
      return findUserFor2FALogin(pending.userId);
    });

    if (!user?.twoFactorSecret) {
      logger.warn("2FA verify failed: No secret configured", {
        userId: pending.userId,
      });
      span.setAttribute("failure.reason", "no_secret_configured");
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    // 3. Verify the code
    const valid = await withSpan("VerifyAuthenticationCode", async () => {
      if (isBackupCode) {
        return verifyBackupCode(user.id, code);
      }

      try {
        // Ensure secret is not null before decrypting
        if (!user.twoFactorSecret) {
          return false;
        }
        return authenticator.verify({
          token: code,
          secret: decrypt(user.twoFactorSecret),
        });
      } catch (error) {
        logger.error("TOTP verification error", {
          userId: user.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return false;
      }
    });

    if (!valid) {
      logger.warn("2FA verify failed: Invalid code", {
        userId: user.id,
        isBackupCode,
      });
      span.setAttribute("failure.reason", "invalid_code");
      throw new ValidationError(ErrorCode.INVALID_2FA_CODE);
    }

    // 4. Create session
    const token = await withSpan("CreateSession", async () => {
      return signToken({
        userId: user.id,
        email: user.email,
        role: user.userRole,
        passwordVersion: user.passwordVersion,
      });
    });

    // 5. Set authentication cookie
    await withSpan("SetAuthenticationCookie", async () => {
      await setAuthCookie(token);
    });

    logger.info("User logged in successfully (2FA)", {
      userId: user.id,
      email: user.email,
      role: user.userRole,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.userRole,
    };
  });
}