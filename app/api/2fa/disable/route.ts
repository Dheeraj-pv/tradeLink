import { NextRequest } from "next/server";
import { disableTwoFactorController } from "@/controllers/auth/disable-2fa.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await disableTwoFactorController(req);
  } catch (error) {
    return handleApiError(error);
  }
}