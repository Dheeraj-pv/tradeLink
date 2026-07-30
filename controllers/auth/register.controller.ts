import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { register } from "@/services/auth/register.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function registerController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const user = await register(parsed.data);

  return NextResponse.json(
    {
      message: "User registered successfully.",
      data: {
        user,
      },
    },
    {
      status: 201,
    },
  );
}