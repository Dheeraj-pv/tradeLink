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

type LoginInput = z.infer<typeof loginSchema>;

interface LoginResult {
  requiresTwoFactor: boolean;
  pendingToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: "CUSTOMER" | "PROVIDER";
  };
}

export async function login(input: LoginInput): Promise<LoginResult> {
  return withSpan("Login User", async (span) => {
    const normalizedEmail = input.email.toLowerCase().trim();

    logger.info({ email: normalizedEmail }, "Login attempt");

    const user = await withSpan("Load User", async () => {
      return authRepository.findUserForLogin(normalizedEmail);
    });

    if (!user) {
      span.setAttribute("failure.reason", "user_not_found");

      logger.warn({ email: normalizedEmail }, "Login failed: user not found");

      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);
    span.setAttribute("user.role", user.userRole);
    span.setAttribute("auth.2fa_enabled", user.twoFactorEnabled);

    const passwordValid = await withSpan("Verify Password", async () => {
      return verifyPassword(input.password, user.password);
    });

    if (!passwordValid) {
      span.setAttribute("failure.reason", "invalid_password");

      logger.warn(
        {
          userId: user.id,
          email: user.email,
        },
        "Login failed: invalid password",
      );

      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    if (user.twoFactorEnabled) {
      const pendingToken = await withSpan(
        "Create Pending Session",
        async () => {
          return signPendingToken({
            userId: user.id,
          });
        },
      );

      logger.info({ userId: user.id }, "Password verified, awaiting 2FA code");

      return {
        requiresTwoFactor: true,
        pendingToken,
      };
    }

    const token = await withSpan("Create Session", async () => {
      return signToken({
        userId: user.id,
        email: user.email,
        role: user.userRole,
        passwordVersion: user.passwordVersion,
      });
    });

    await withSpan("Set Authentication Cookie", async () => {
      await setAuthCookie(token);
    });

    logger.info(
      {
        userId: user.id,
        role: user.userRole,
      },
      "User logged in successfully",
    );

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
