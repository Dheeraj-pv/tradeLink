import { NextRequest } from "next/server";
import { enableTwoFactorController } from "@/controllers/auth/enable-2fa.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await enableTwoFactorController(req);
  } catch (error) {
    return handleApiError(error);
  }
}