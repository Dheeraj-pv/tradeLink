// services/provider/provider-settings.service.ts

import { authenticator } from "otplib";
import { decrypt } from "@/lib/crypto";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { verifyBackupCode } from "@/lib/auth/backup-codes";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { getMediaUrl } from "@/lib/minio";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as providerSettingsRepository from "@/repositories/provider/provider-settings.repository";
import { z } from "zod";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const profileSchema = z.object({
  action: z.literal("profile"),
  name: z.string().trim().min(1),
  phone: z.string().optional(),
  categoryIds: z.array(z.number()).min(1),
});

const passwordSchema = z
  .object({
    action: z.literal("password"),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
    twoFactorCode: z.string().optional(),
  })
  .refine((d) => d.newPassword === d.confirmPassword);

type UpdateProfileInput = z.infer<typeof profileSchema>;
type ChangePasswordInput = z.infer<typeof passwordSchema>;

export async function getProviderSettings() {
  return withSpan("Get Provider Settings", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider requested settings",
    );

    const [
      fullUser,
      providerDetails,
      certifications,
      categories,
      providerCategories,
    ] = await withSpan("Load Profile", async () => {
      return providerSettingsRepository.getProviderSettings(user.id);
    });

    if (!fullUser) {
      span.setAttribute("failure.reason", "user_not_found");

      throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
    }

    span.setAttribute("certifications.count", certifications.length);
    span.setAttribute("categories.selected_count", providerCategories.length);
    span.setAttribute("categories.available_count", categories.length);

    logger.info(
      {
        userId: user.id,
        certificationCount: certifications.length,
        categoryCount: providerCategories.length,
      },
      "Provider settings loaded successfully",
    );

    return {
      profile: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        phone: fullUser.phone ?? "",
        profileImage: providerDetails?.profileImage
          ? getMediaUrl(providerDetails.profileImage)
          : null,
        memberSince: fullUser.createdAt.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        avgRating: providerDetails?.avgRating ?? 0,
        reviewCount: providerDetails?.reviewCount ?? 0,
        categoryIds: providerCategories.map((p) => p.categoryId),
      },
      certifications: certifications.map((cert) => ({
        id: cert.id,
        title: cert.title,
        filePath: cert.filePath,
        url: cert.filePath ? getMediaUrl(cert.filePath) : null,
      })),
      categories,
    };
  });
}

export async function updateProviderProfile(data: UpdateProfileInput) {
  return withSpan("Update Provider Profile", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider updating profile",
    );

    await withSpan("Update Profile", async () => {
      await providerSettingsRepository.updateProviderProfile(
        user.id,
        data.name,
        data.phone ?? null,
        data.categoryIds,
      );
    });

    span.setAttribute("categories.selected_count", data.categoryIds.length);

    logger.info(
      {
        userId: user.id,
        categoryCount: data.categoryIds.length,
      },
      "Provider profile updated successfully",
    );
  });
}

export async function changeProviderPassword(data: ChangePasswordInput) {
  return withSpan("Change Provider Password", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider changing password",
    );

    const dbUser = await withSpan("Load User", async () => {
      return providerSettingsRepository.findPasswordInfo(user.id);
    });

    if (!dbUser) {
      span.setAttribute("failure.reason", "user_not_found");

      throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
    }

    const valid = await withSpan("Verify Current Password", async () => {
      return verifyPassword(data.currentPassword, dbUser.password);
    });

    if (!valid) {
      span.setAttribute("failure.reason", "invalid_password");

      logger.warn(
        {
          userId: user.id,
        },
        "Password change failed: incorrect current password",
      );

      throw new AuthenticationError(ErrorCode.CURRENT_PASSWORD_MISMATCH);
    }

    if (dbUser.twoFactorEnabled) {
      if (!data.twoFactorCode) {
        span.setAttribute("failure.reason", "missing_2fa_code");

        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }
      const twoFactorCode = data.twoFactorCode;

      const verified = await withSpan(
        "Verify Two-Factor Authentication",
        async () => {
          if (await verifyBackupCode(user.id, twoFactorCode)) {
            return true;
          }

          return authenticator.verify({
            token: twoFactorCode,
            secret: decrypt(dbUser.twoFactorSecret!),
          });
        },
      );

      if (!verified) {
        span.setAttribute("failure.reason", "invalid_2fa_code");

        logger.warn(
          {
            userId: user.id,
          },
          "Provider supplied an invalid 2FA code",
        );

        throw new AuthenticationError(ErrorCode.INVALID_2FA_CODE);
      }
    }

    const hashed = await withSpan("Hash Password", async () => {
      return hashPassword(data.newPassword);
    });

    await withSpan("Update Password", async () => {
      await providerSettingsRepository.updatePassword(user.id, hashed);
    });

    logger.info(
      {
        userId: user.id,
      },
      "Provider password changed successfully",
    );
  });
}

export async function deleteProviderAccount() {
  return withSpan("Delete Provider Account", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider deleting account",
    );

    await withSpan("Delete Account", async () => {
      await providerSettingsRepository.deleteProviderAccount(user.id);
    });

    logger.info(
      {
        userId: user.id,
      },
      "Provider account deleted successfully",
    );
  });
}
