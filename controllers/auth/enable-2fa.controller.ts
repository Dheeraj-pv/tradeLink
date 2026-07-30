import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors/ValidationError";
import { enableTwoFactor } from "@/services/auth/enable-2fa.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const enableTwoFactorSchema = z.object({
  code: z.string().trim().min(1),
});

export async function enableTwoFactorController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = enableTwoFactorSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const backupCodes = await enableTwoFactor(parsed.data.code);

  return NextResponse.json(
    {
      message: "Two-factor authentication enabled successfully.",
      data: {
        backupCodes,
      },
    },
    {
      status: 200,
    },
  );
}
