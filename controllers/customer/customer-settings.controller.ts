// controllers/customer/customer-settings.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteCustomerAccount,
  getCustomerSettings,
  updateCustomerPassword,
  updateCustomerProfile,
} from "@/services/customer/customer-settings.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
type ProfileUpdateData = {
  action: "profile";
  name: string;
  phone?: string | null;
};

type PasswordUpdateData = {
  action: "password";
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode?: string;
};

type SettingsUpdateData = ProfileUpdateData | PasswordUpdateData;

type SettingsResponse = {
  message: string;
  data?: {
    profile?: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
  };
};

// Validation schemas
const profileSchema = z.object({
  action: z.literal("profile"),
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional().nullable(),
});

const passwordSchema = z
  .object({
    action: z.literal("password"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
    twoFactorCode: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const settingsSchema = z.discriminatedUnion("action", [
  profileSchema,
  passwordSchema,
]);

/**
 * Get Customer Settings Controller
 */
export async function getCustomerSettingsController() {
  logger.info("Get customer settings request");

  const profile = await getCustomerSettings();

  logger.info("Customer settings loaded", {
    userId: profile?.id,
    email: profile?.email,
  });

  const response: SettingsResponse = {
    message: "Customer settings loaded successfully.",
    data: {
      profile,
    },
  };

  return NextResponse.json(response, {
    status: 200,
  });
}

/**
 * Update Customer Settings Controller
 */
export async function updateCustomerSettingsController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Update customer settings: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Update customer settings: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const validatedData: SettingsUpdateData = parsed.data;

  if (validatedData.action === "profile") {
    logger.info("Update customer profile request", {
      name: validatedData.name,
      hasPhone: !!validatedData.phone,
    });

    await updateCustomerProfile({
      name: validatedData.name,
      phone: validatedData.phone,
    });

    logger.info("Customer profile updated successfully");

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
      },
      {
        status: 200,
      },
    );
  }

  // Password update
  logger.info("Update customer password request", {
    hasTwoFactorCode: !!validatedData.twoFactorCode,
  });

  await updateCustomerPassword({
    currentPassword: validatedData.currentPassword,
    newPassword: validatedData.newPassword,
    twoFactorCode: validatedData.twoFactorCode,
  });

  logger.info("Customer password updated successfully");

  return NextResponse.json(
    {
      message: "Password updated successfully.",
    },
    {
      status: 200,
    },
  );
}

/**
 * Delete Customer Settings Controller
 */
export async function deleteCustomerSettingsController() {
  logger.info("Delete customer account request");

  await deleteCustomerAccount();

  logger.info("Customer account deleted successfully");

  return NextResponse.json(
    {
      message: "Account deleted successfully.",
    },
    {
      status: 200,
    },
  );
}