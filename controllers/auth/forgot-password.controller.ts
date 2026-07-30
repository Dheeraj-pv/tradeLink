import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { ValidationError } from "@/lib/errors/ValidationError";
import { forgotPassword } from "@/services/auth/forgot-password.service";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export async function forgotPasswordController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  await forgotPassword(parsed.data.email);

  return NextResponse.json(
    {
      message: "If that email is registered, a reset link has been sent.",
    },
    {
      status: 200,
    },
  );
}