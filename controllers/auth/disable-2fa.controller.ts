// controllers/auth/disable-2fa.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors/ValidationError";
import { disableTwoFactor } from "@/services/auth/disable-2fa.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
type DisableTwoFactorRequest = {
  code: string;
  isBackupCode?: boolean;
};

// Validation schema
const disableTwoFactorSchema = z.object({
  code: z.string().trim().min(1),
  isBackupCode: z.boolean().optional(),
});

/**
 * Disable Two-Factor Authentication Controller
 */
export async function disableTwoFactorController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Disable 2FA: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = disableTwoFactorSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Disable 2FA: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const validatedData: DisableTwoFactorRequest = parsed.data;

  logger.info("Disable 2FA request", {
    hasCode: !!validatedData.code,
    isBackupCode: validatedData.isBackupCode || false,
  });

  await disableTwoFactor(parsed.data);

  logger.info("2FA disabled successfully");

  return NextResponse.json(
    {
      message: "Two-factor authentication disabled successfully.",
    },
    {
      status: 200,
    },
  );
}