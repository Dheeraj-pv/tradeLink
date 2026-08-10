// controllers/auth/reset-password.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resetPassword,
  validateResetToken,
} from "@/services/auth/reset-password.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
type ResetPasswordRequest = {
  token: string;
  password: string;
  totpCode?: string;
  isBackupCode?: boolean;
};

type ResetPasswordResponse = {
  message: string;
  data?: {
    requiresTwoFactor?: boolean;
  };
};

type ValidateTokenResponse = {
  message: string;
  data: {
    valid: boolean;
    requiresTwoFactor?: boolean;
  };
};

// Validation schema
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

/**
 * Reset Password Controller
 */
export async function resetPasswordController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Reset password: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Reset password: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const validatedData: ResetPasswordRequest = parsed.data;

  logger.info("Reset password attempt", {
    hasToken: !!validatedData.token,
    hasTotpCode: !!validatedData.totpCode,
    isBackupCode: validatedData.isBackupCode || false,
  });

  const result = await resetPassword(validatedData);

  if (result.requiresTwoFactor) {
    logger.info("Reset password requires 2FA");

    const response: ResetPasswordResponse = {
      message: "Two-factor authentication required.",
      data: {
        requiresTwoFactor: true,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  }

  logger.info("Password reset successful");

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

/**
 * Validate Reset Token Controller
 */
export async function validateResetTokenController(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    logger.warn("Validate reset token: No token provided");
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  logger.info("Validate reset token request", {
    hasToken: !!token,
  });

  const result = await validateResetToken(token);

  logger.info("Reset token validated", {
    valid: result.valid,
    requiresTwoFactor: result.requiresTwoFactor || false,
  });

  const response: ValidateTokenResponse = {
    message: "Reset token validated successfully.",
    data: result,
  };

  return NextResponse.json(response, {
    status: 200,
  });
}