import { NextRequest } from "next/server";
import { verify2FALoginController } from "@/controllers/auth/verify-2fa-login.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await verify2FALoginController(req);
  } catch (error) {
    return handleApiError(error);
  }
}
