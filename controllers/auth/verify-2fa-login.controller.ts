import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors/ValidationError";
import { verify2FALogin } from "@/services/auth/verify-2fa-login.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const schema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().min(1),
  isBackupCode: z.boolean().optional(),
});

export async function verify2FALoginController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const user = await verify2FALogin(parsed.data);

  return NextResponse.json(
    {
      message: "Login successful.",
      data: {
        user,
      },
    },
    {
      status: 200,
    },
  );
}
