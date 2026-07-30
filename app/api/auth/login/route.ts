import { NextRequest } from "next/server";
import { loginController } from "@/controllers/auth/login.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await loginController(req);
  } catch (error) {
    return handleApiError(error);
  }
}