// controllers/auth/verify-2fa-login.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors/ValidationError";
import { verify2FALogin } from "@/services/auth/verify-2fa-login.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
type Verify2FALoginRequest = {
  pendingToken: string;
  code: string;
  isBackupCode?: boolean;
};

type Verify2FALoginResponse = {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
};

// Validation schema
const schema = z.object({
  pendingToken: z.string().min(1, "Pending token is required"),
  code: z.string().min(1, "Code is required"),
  isBackupCode: z.boolean().optional(),
});

/**
 * Verify 2FA Login Controller
 */
export async function verify2FALoginController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Verify 2FA login: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Verify 2FA login: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const validatedData: Verify2FALoginRequest = parsed.data;

  logger.info("Verify 2FA login attempt", {
    hasPendingToken: !!validatedData.pendingToken,
    hasCode: !!validatedData.code,
    isBackupCode: validatedData.isBackupCode || false,
  });

  const user = await verify2FALogin(validatedData);

  logger.info("2FA login successful", {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response: Verify2FALoginResponse = {
    message: "Login successful.",
    data: {
      user,
    },
  };

  return NextResponse.json(response, {
    status: 200,
  });
}