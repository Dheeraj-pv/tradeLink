// controllers/provider/provider-settings.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getProviderSettings,
  updateProviderProfile,
  changeProviderPassword,
  deleteProviderAccount,
} from "@/services/provider/provider-settings.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions
type ProfileRequest = {
  action: "profile";
  name: string;
  phone?: string;
  categoryIds: number[];
};

type PasswordRequest = {
  action: "password";
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode?: string;
};

type SettingsRequest = ProfileRequest | PasswordRequest;

// Match what getProviderSettings actually returns
type Certification = {
  id: string;
  title: string;
  filePath: string;
  url: string | null;
};

type Category = {
  id: number;
  name: string;
};

type ProviderSettingsData = {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
    memberSince: string;
    avgRating: number;
    reviewCount: number;
    categoryIds: number[];
  };
  certifications: Certification[];
  categories: Category[];
};

type GetSettingsResponse = {
  message: string;
  data: ProviderSettingsData;
};

type UpdateSettingsResponse = {
  message: string;
};

type DeleteAccountResponse = {
  message: string;
};

// Validation schemas
const profileSchema = z.object({
  action: z.literal("profile"),
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().optional(),
  categoryIds: z.array(z.number()).min(1, "Select at least one category"),
});

const passwordSchema = z
  .object({
    action: z.literal("password"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    twoFactorCode: z.string().optional(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Get Provider Settings Controller
 * Retrieves provider profile and settings
 */
export async function getProviderSettingsController(): Promise<NextResponse> {
  return withSpan("GetProviderSettingsController", async (span) => {
    logger.info("Get provider settings request");

    const data = await getProviderSettings();

    logger.info("Provider settings loaded successfully", {
      userId: data?.profile?.id,
      email: data?.profile?.email,
      categoryCount: data?.categories?.length || 0,
    });

    const response: GetSettingsResponse = {
      message: "Provider settings loaded successfully.",
      data,
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}

/**
 * Update Provider Settings Controller
 * Handles profile and password updates
 */
export async function updateProviderSettingsController(
  req: NextRequest,
): Promise<NextResponse> {
  return withSpan("UpdateProviderSettingsController", async (span) => {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logger.warn("Update provider settings: Invalid request body");
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    // Check if body has an action
    if (typeof body !== "object" || body === null || !("action" in body)) {
      logger.warn("Update provider settings: Missing action field");
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    // Handle profile update
    if (body.action === "profile") {
      const parsed = profileSchema.safeParse(body);

      if (!parsed.success) {
        logger.warn("Update provider profile: Validation failed", {
          errors: parsed.error.issues,
        });
        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      const validatedData: ProfileRequest = parsed.data;

      logger.info("Update provider profile request", {
        name: validatedData.name,
        hasPhone: !!validatedData.phone,
        categoryCount: validatedData.categoryIds?.length || 0,
      });

      span.setAttribute("hasPhone", !!validatedData.phone);
      span.setAttribute("categoryCount", validatedData.categoryIds?.length || 0);

      await updateProviderProfile(validatedData);

      logger.info("Provider profile updated successfully");

      const response: UpdateSettingsResponse = {
        message: "Provider profile updated successfully.",
      };

      return NextResponse.json(response, {
        status: 200,
      });
    }

    // Handle password update
    if (body.action === "password") {
      const parsed = passwordSchema.safeParse(body);

      if (!parsed.success) {
        logger.warn("Update provider password: Validation failed", {
          errors: parsed.error.issues,
        });
        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      const validatedData: PasswordRequest = parsed.data;

      logger.info("Update provider password request", {
        hasTwoFactorCode: !!validatedData.twoFactorCode,
      });

      span.setAttribute("hasTwoFactorCode", !!validatedData.twoFactorCode);

      await changeProviderPassword(validatedData);

      logger.info("Provider password changed successfully");

      const response: UpdateSettingsResponse = {
        message: "Password changed successfully.",
      };

      return NextResponse.json(response, {
        status: 200,
      });
    }

    logger.warn("Update provider settings: Invalid action", {
      action: (body as any).action,
    });
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  });
}

/**
 * Delete Provider Account Controller
 * Permanently deletes provider account
 */
export async function deleteProviderAccountController(): Promise<NextResponse> {
  return withSpan("DeleteProviderAccountController", async (span) => {
    logger.info("Delete provider account request");

    await deleteProviderAccount();

    logger.info("Provider account deleted successfully");

    const response: DeleteAccountResponse = {
      message: "Provider account deleted successfully.",
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}