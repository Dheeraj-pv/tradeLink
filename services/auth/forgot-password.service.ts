// services/auth/forgot-password.service.ts
import { sendPasswordResetEmail } from "@/lib/email";
import { generateResetToken } from "@/lib/auth/token";
import { withSpan } from "@/lib/tracing";
import * as authRepository from "@/repositories/auth/auth.repository";
import { logger } from "@/lib/logger";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Forgot Password Service
 * Generates a password reset token and sends it via email
 */
export async function forgotPassword(email: string): Promise<void> {
  return withSpan("ForgotPasswordService", async (span) => {
    const normalizedEmail = email.toLowerCase();

    logger.info("Forgot password request", {
      email: normalizedEmail,
    });

    // 1. Find user by email
    const user = await withSpan("LoadUser", async () => {
      return authRepository.findPasswordResetUser(normalizedEmail);
    });

    // Always succeed even if the email doesn't exist to
    // prevent account enumeration.
    if (!user) {
      logger.info("Forgot password: User not found (silent)", {
        email: normalizedEmail,
      });
      span.setAttribute("user.exists", false);
      return;
    }

    span.setAttribute("user.id", user.id);
    span.setAttribute("user.exists", true);

    logger.info("Forgot password: User found", {
      userId: user.id,
      email: normalizedEmail,
    });

    // 2. Generate reset token
    const { rawToken, hashedToken } = await withSpan(
      "GenerateResetToken",
      async () => {
        return generateResetToken();
      },
    );

    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    // 3. Store reset token
    await withSpan("StoreResetToken", async () => {
      await authRepository.replacePasswordResetToken(
        user.id,
        hashedToken,
        expiresAt,
      );
    });

    logger.info("Password reset token stored", {
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
    });

    // 4. Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}`;

    span.setAttribute("email.queued", true);

    // 5. Send email (fire and forget)
    void withSpan("SendPasswordResetEmail", async () => {
      await sendPasswordResetEmail(user.email, resetUrl);
      logger.info("Password reset email sent", {
        userId: user.id,
        email: normalizedEmail,
      });
    }).catch((error: unknown) => {
      logger.error("Failed to send password reset email", {
        userId: user.id,
        email: normalizedEmail,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });
  });
}