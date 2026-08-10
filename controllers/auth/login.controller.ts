// controllers/auth/login.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { login } from "@/services/auth/login.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  data: {
    requiresTwoFactor?: boolean;
    pendingToken?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
};

/**
 * Login Controller
 */
export async function loginController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Login: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Login: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const validatedData: LoginRequest = parsed.data;

  logger.info("Login attempt", {
    email: validatedData.email,
  });

  const result = await login(validatedData);

  if (result.requiresTwoFactor) {
    logger.info("Login requires 2FA", {
      email: validatedData.email,
    });

    const response: LoginResponse = {
      message: "Two-factor authentication required.",
      data: {
        requiresTwoFactor: true,
        pendingToken: result.pendingToken,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  }

  logger.info("Login successful", {
    userId: result.user?.id,
    email: validatedData.email,
    role: result.user?.role,
  });

  const response: LoginResponse = {
    message: "Login successful.",
    data: {
      user: result.user,
    },
  };

  return NextResponse.json(response, {
    status: 200,
  });
}