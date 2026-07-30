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

export async function getProviderSettingsController() {
  const data = await getProviderSettings();

  return NextResponse.json(
    {
      message: "Provider settings loaded successfully.",
      data,
    },
    {
      status: 200,
    },
  );
}

export async function updateProviderSettingsController(
  req: NextRequest,
) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("action" in body)
  ) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  if (body.action === "profile") {
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    await updateProviderProfile(parsed.data);

    return NextResponse.json(
      {
        message: "Provider profile updated successfully.",
      },
      {
        status: 200,
      },
    );
  }

  if (body.action === "password") {
    const parsed = passwordSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    await changeProviderPassword(parsed.data);

    return NextResponse.json(
      {
        message: "Password changed successfully.",
      },
      {
        status: 200,
      },
    );
  }

  throw new ValidationError(ErrorCode.INVALID_INPUT);
}

export async function deleteProviderAccountController() {
  await deleteProviderAccount();

  return NextResponse.json(
    {
      message: "Provider account deleted successfully.",
    },
    {
      status: 200,
    },
  );
}