// controllers/auth/enable-2fa.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors/ValidationError";
import { enableTwoFactor } from "@/services/auth/enable-2fa.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
type EnableTwoFactorRequest = {
  code: string;
};

type EnableTwoFactorResponse = {
  message: string;
  data: {
    backupCodes: string[];
  };
};

// Validation schema
const enableTwoFactorSchema = z.object({
  code: z.string().trim().min(1),
});

/**
 * Enable Two-Factor Authentication Controller
 */
export async function enableTwoFactorController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Enable 2FA: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = enableTwoFactorSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Enable 2FA: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const validatedData: EnableTwoFactorRequest = parsed.data;

  logger.info("Enable 2FA request", {
    hasCode: !!validatedData.code,
  });

  const backupCodes = await enableTwoFactor(validatedData.code);

  logger.info("2FA enabled successfully", {
    backupCodesCount: backupCodes.length,
  });

  const response: EnableTwoFactorResponse = {
    message: "Two-factor authentication enabled successfully.",
    data: {
      backupCodes,
    },
  };

  return NextResponse.json(response, {
    status: 200,
  });
}