import { authenticator } from "otplib";
import QRCode from "qrcode";
import { encrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import * as authRepository from "@/repositories/auth/auth.repository";
import { withSpan } from "@/lib/tracing";

interface InitializeTwoFactorResult {
  qrCodeDataUrl: string;
  secret: string;
}

export async function initializeTwoFactor(): Promise<InitializeTwoFactorResult> {
  return withSpan("Initialize Two-Factor Authentication", async (span) => {
    const currentUser = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", currentUser.id);

    const { secret, qrCodeDataUrl } = await withSpan(
      "Generate 2FA Secret",
      async () => {
        const secret = authenticator.generateSecret();

        const otpauthUrl = authenticator.keyuri(
          currentUser.email,
          "tradeLink",
          secret,
        );

        const qrCodeDataUrl = await withSpan("Generate QR Code", async () => {
          return QRCode.toDataURL(otpauthUrl);
        });

        return {
          secret,
          qrCodeDataUrl,
        };
      },
    );

    await withSpan("Store Pending 2FA Secret", async () => {
      await authRepository.storeTwoFactorSecret(
        currentUser.id,
        encrypt(secret),
      );
    });

    return {
      qrCodeDataUrl,
      secret,
    };
  });
}
