import { NextRequest } from "next/server";
import { forgotPasswordController } from "@/controllers/auth/forgot-password.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await forgotPasswordController(req);
  } catch (error) {
    return handleApiError(error);
  }
}