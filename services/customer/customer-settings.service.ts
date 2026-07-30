// services/customer/customer-settings.service.ts

import { authenticator } from "otplib";
import { decrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { verifyBackupCode } from "@/lib/auth/backup-codes";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as customerSettingsRepository from "@/repositories/customer/customer-settings.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type UpdateProfileInput = {
  name: string;
  phone?: string | null;
};

type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string;
};

export async function getCustomerSettings() {
  return withSpan("Get Customer Settings", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Customer requested settings",
    );

    const profile = await withSpan("Load Profile", async () => {
      return customerSettingsRepository.findProfile(user.id);
    });

    if (!profile) {
      span.setAttribute("failure.reason", "user_not_found");

      logger.warn(
        {
          userId: user.id,
        },
        "Customer profile not found",
      );

      throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
    }

    logger.info(
      {
        userId: user.id,
      },
      "Customer settings loaded successfully",
    );

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? "",
      memberSince: profile.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    };
  });
}

export async function updateCustomerProfile(
  input: UpdateProfileInput,
) {
  return withSpan("Update Customer Profile", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Customer requested profile update",
    );

    await withSpan("Update Profile", async () => {
      await customerSettingsRepository.updateProfile(
        user.id,
        input.name,
        input.phone ?? null,
      );
    });

    logger.info(
      {
        userId: user.id,
      },
      "Customer profile updated successfully",
    );
  });
}

export async function updateCustomerPassword(
  input: UpdatePasswordInput,
) {
  return withSpan("Update Customer Password", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Customer requested password change",
    );

    const dbUser = await withSpan("Load User", async () => {
      return customerSettingsRepository.findPasswordDetails(user.id);
    });

    if (!dbUser) {
      span.setAttribute("failure.reason", "user_not_found");

      throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
    }

    const valid = await withSpan(
      "Verify Current Password",
      async () => {
        return verifyPassword(
          input.currentPassword,
          dbUser.password,
        );
      },
    );

    if (!valid) {
      span.setAttribute(
        "failure.reason",
        "invalid_current_password",
      );

      logger.warn(
        {
          userId: user.id,
        },
        "Customer provided incorrect current password",
      );

      throw new AuthenticationError(
        ErrorCode.CURRENT_PASSWORD_MISMATCH,
      );
    }

    if (dbUser.twoFactorEnabled) {
      if (!input.twoFactorCode) {
        span.setAttribute("failure.reason", "missing_2fa_code");

        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      const verified = await withSpan(
        "Verify Two-Factor Authentication",
        async () => {
          if (
            await verifyBackupCode(
              user.id,
              input.twoFactorCode!,
            )
          ) {
            return true;
          }

          return authenticator.verify({
            token: input.twoFactorCode!,
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
          "Customer supplied an invalid 2FA code",
        );

        throw new AuthenticationError(
          ErrorCode.INVALID_TOKEN,
        );
      }
    }

    const hashed = await withSpan("Hash Password", async () => {
      return hashPassword(input.newPassword);
    });

    await withSpan("Update Password", async () => {
      await customerSettingsRepository.updatePassword(
        user.id,
        hashed,
      );
    });

    logger.info(
      {
        userId: user.id,
      },
      "Customer password updated successfully",
    );
  });
}

export async function deleteCustomerAccount() {
  return withSpan("Delete Customer Account", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Customer requested account deletion",
    );

    await withSpan("Delete Account", async () => {
      await customerSettingsRepository.deleteAccount(user.id);
    });

    logger.info(
      {
        userId: user.id,
      },
      "Customer account deleted successfully",
    );
  });
}