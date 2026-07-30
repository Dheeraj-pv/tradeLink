import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { login } from "@/services/auth/login.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function loginController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const result = await login(parsed.data);

  if (result.requiresTwoFactor) {
    return NextResponse.json(
      {
        message: "Two-factor authentication required.",
        data: {
          requiresTwoFactor: true,
          pendingToken: result.pendingToken,
        },
      },
      {
        status: 200,
      },
    );
  }

  return NextResponse.json(
    {
      message: "Login successful.",
      data: {
        user: result.user,
      },
    },
    {
      status: 200,
    },
  );
}