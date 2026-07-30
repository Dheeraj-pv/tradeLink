import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors/ValidationError";
import { disableTwoFactor } from "@/services/auth/disable-2fa.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const disableTwoFactorSchema = z.object({
  code: z.string().trim().min(1),
  isBackupCode: z.boolean().optional(),
});

export async function disableTwoFactorController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = disableTwoFactorSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  await disableTwoFactor(parsed.data);

  return NextResponse.json(
    {
      message: "Two-factor authentication disabled successfully.",
    },
    {
      status: 200,
    },
  );
}
