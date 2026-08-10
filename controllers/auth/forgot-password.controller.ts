// controllers/auth/forgot-password.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { ValidationError } from "@/lib/errors/ValidationError";
import { forgotPassword } from "@/services/auth/forgot-password.service";
import { logger } from "@/lib/logger";

// Type definitions
type ForgotPasswordRequest = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
};

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

/**
 * Forgot Password Controller
 */
export async function forgotPasswordController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Forgot password: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Forgot password: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const validatedData: ForgotPasswordRequest = parsed.data;

  logger.info("Forgot password request", {
    email: validatedData.email,
  });

  await forgotPassword(validatedData.email);

  logger.info("Forgot password processed", {
    email: validatedData.email,
  });

  const response: ForgotPasswordResponse = {
    message: "If that email is registered, a reset link has been sent.",
  };

  return NextResponse.json(response, {
    status: 200,
  });
}