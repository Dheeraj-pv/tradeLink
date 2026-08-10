// services/auth/initialize-2fa.service.ts
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { encrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import * as authRepository from "@/repositories/auth/auth.repository";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { withSpan } from "@/lib/tracing";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

interface InitializeTwoFactorResult {
  qrCodeDataUrl: string;
  secret: string;
}

/**
 * Initialize Two-Factor Authentication Service
 * Generates a TOTP secret and QR code for authenticator app setup
 */
export async function initializeTwoFactor(): Promise<InitializeTwoFactorResult> {
  return withSpan("InitializeTwoFactorService", async (span) => {
    // 1. Get current user
    const currentUser = await withSpan("AuthenticateUser", async () => {
      const user = await getCurrentUser();
      if (!user) {
        throw new AuthenticationError(ErrorCode.INVALID_TOKEN);
      }
      return user;
    });

    logger.info("Initialize 2FA request", {
      userId: currentUser.id,
      email: currentUser.email,
    });

    span.setAttribute("user.id", currentUser.id);

    // 2. Generate 2FA secret and QR code
    const { secret, qrCodeDataUrl } = await withSpan(
      "Generate2FASecret",
      async () => {
        const secret = authenticator.generateSecret();

        const otpauthUrl = authenticator.keyuri(
          currentUser.email,
          "tradeLink",
          secret,
        );

        const qrCodeDataUrl = await withSpan("GenerateQRCode", async () => {
          try {
            return await QRCode.toDataURL(otpauthUrl);
          } catch (error) {
            logger.error("QR code generation failed", {
              userId: currentUser.id,
              error: error instanceof Error ? error.message : "Unknown error",
            });
            throw new Error("Failed to generate QR code");
          }
        });

        return {
          secret,
          qrCodeDataUrl,
        };
      },
    );

    logger.info("2FA secret generated", {
      userId: currentUser.id,
      hasQrCode: !!qrCodeDataUrl,
    });

    // 3. Store encrypted secret
    await withSpan("StorePending2FASecret", async () => {
      await authRepository.storeTwoFactorSecret(
        currentUser.id,
        encrypt(secret),
      );
    });

    logger.info("2FA secret stored pending confirmation", {
      userId: currentUser.id,
    });

    return {
      qrCodeDataUrl,
      secret,
    };
  });
}   