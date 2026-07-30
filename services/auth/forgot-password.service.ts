import { sendPasswordResetEmail } from "@/lib/email";
import { generateResetToken } from "@/lib/auth/token";
import { withSpan } from "@/lib/tracing";
import * as authRepository from "@/repositories/auth/auth.repository";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function forgotPassword(email: string): Promise<void> {
  return withSpan("Request Password Reset", async (span) => {
    const normalizedEmail = email.toLowerCase();

    const user = await withSpan("Load User", async () => {
      return authRepository.findPasswordResetUser(normalizedEmail);
    });

    // Always succeed even if the email doesn't exist to
    // prevent account enumeration.
    if (!user) {
      span.setAttribute("user.exists", false);
      return;
    }

    span.setAttribute("user.id", user.id);

    const { rawToken, hashedToken } = await withSpan(
      "Generate Reset Token",
      async () => {
        return generateResetToken();
      },
    );

    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await withSpan("Store Reset Token", async () => {
      await authRepository.replacePasswordResetToken(
        user.id,
        hashedToken,
        expiresAt,
      );
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}`;

    span.setAttribute("email.queued", true);

    // Fire and forget — don't block the response.
    void withSpan("Send Password Reset Email", async () => {
      await sendPasswordResetEmail(user.email, resetUrl);
    }).catch((error: unknown) => {
      console.error("Failed to send password reset email:", error);
    });
  });
}
