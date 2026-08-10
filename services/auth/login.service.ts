// services/auth/login.service.ts
import { verifyPassword } from "@/lib/auth/password";
import { signPendingToken, signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/auth/schemas";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as authRepository from "@/repositories/auth/auth.repository";
import { z } from "zod";
import { ErrorCode } from "@/lib/errors/ErrorCode";

// Type definitions
type LoginInput = z.infer<typeof loginSchema>;

type LoginResult = {
  requiresTwoFactor: boolean;
  pendingToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: "CUSTOMER" | "PROVIDER";
  };
};

/**
 * Login Service
 * Handles user authentication with 2FA support
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  return withSpan("LoginService", async (span) => {
    const normalizedEmail = input.email.toLowerCase().trim();

    logger.info("Login attempt", {
      email: normalizedEmail,
    });

    // 1. Find user
    const user = await withSpan("LoadUser", async () => {
      return authRepository.findUserForLogin(normalizedEmail);
    });

    if (!user) {
      logger.warn("Login failed: User not found", {
        email: normalizedEmail,
      });
      span.setAttribute("failure.reason", "user_not_found");
      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);
    span.setAttribute("user.role", user.userRole);
    span.setAttribute("auth.2fa_enabled", user.twoFactorEnabled);

    // 2. Verify password
    const passwordValid = await withSpan("VerifyPassword", async () => {
      return verifyPassword(input.password, user.password);
    });

    if (!passwordValid) {
      logger.warn("Login failed: Invalid password", {
        userId: user.id,
        email: user.email,
      });
      span.setAttribute("failure.reason", "invalid_password");
      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    // 3. Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      const pendingToken = await withSpan("CreatePendingSession", async () => {
        return signPendingToken({
          userId: user.id,
        });
      });

      logger.info("Password verified, awaiting 2FA code", {
        userId: user.id,
        email: user.email,
      });

      return {
        requiresTwoFactor: true,
        pendingToken,
      };
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

    logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
      role: user.userRole,
    });

    return {
      requiresTwoFactor: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userRole,
      },
    };
  });
}