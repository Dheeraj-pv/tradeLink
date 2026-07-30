import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resetPassword,
  validateResetToken,
} from "@/services/auth/reset-password.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character",
    ),
  totpCode: z.string().optional(),
  isBackupCode: z.boolean().optional(),
});

export async function resetPasswordController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const result = await resetPassword(parsed.data);

  if (result.requiresTwoFactor) {
    return NextResponse.json(
      {
        message: "Two-factor authentication required.",
        data: {
          requiresTwoFactor: true,
        },
      },
      {
        status: 200,
      },
    );
  }

  const response = NextResponse.json(
    {
      message: "Password updated successfully.",
    },
    {
      status: 200,
    },
  );

  response.cookies.delete("auth_token");

  return response;
}

export async function validateResetTokenController(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const result = await validateResetToken(token);

  return NextResponse.json(
    {
      message: "Reset token validated successfully.",
      data: result,
    },
    {
      status: 200,
    },
  );
}
