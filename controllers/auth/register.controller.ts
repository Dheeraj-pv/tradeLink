// controllers/auth/register.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { register } from "@/services/auth/register.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";

// Type definitions
type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  role: "CUSTOMER" | "PROVIDER";
  phone?: string | null;
  categoryIds: number[]; // Made required since service expects it
};

type RegisterResponse = {
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

/**
 * Register Controller
 */
export async function registerController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn("Register: Invalid request body");
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("Register: Validation failed", {
      errors: parsed.error.issues,
    });
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const validatedData: RegisterRequest = parsed.data;

  logger.info("Registration attempt", {
    email: validatedData.email,
    role: validatedData.role,
  });

  const user = await register(validatedData);

  logger.info("Registration successful", {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response: RegisterResponse = {
    message: "User registered successfully.",
    data: {
      user,
    },
  };

  return NextResponse.json(response, {
    status: 201,
  });
}