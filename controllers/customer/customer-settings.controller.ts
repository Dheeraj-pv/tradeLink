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

export async function getCustomerSettingsController() {
  const profile = await getCustomerSettings();

  return NextResponse.json(
    {
      message: "Customer settings loaded successfully.",
      data: {
        profile,
      },
    },
    {
      status: 200,
    },
  );
}

export async function updateCustomerSettingsController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  if (parsed.data.action === "profile") {
    await updateCustomerProfile({
      name: parsed.data.name,
      phone: parsed.data.phone,
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
      },
      {
        status: 200,
      },
    );
  }

  await updateCustomerPassword({
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.newPassword,
    twoFactorCode: parsed.data.twoFactorCode,
  });

  return NextResponse.json(
    {
      message: "Password updated successfully.",
    },
    {
      status: 200,
    },
  );
}

export async function deleteCustomerSettingsController() {
  await deleteCustomerAccount();

  return NextResponse.json(
    {
      message: "Account deleted successfully.",
    },
    {
      status: 200,
    },
  );
}
