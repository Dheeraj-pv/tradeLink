import { NextRequest } from "next/server";
import {
  resetPasswordController,
  validateResetTokenController,
} from "@/controllers/auth/reset-password.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await resetPasswordController(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    return await validateResetTokenController(req);
  } catch (error) {
    return handleApiError(error);
  }
}
