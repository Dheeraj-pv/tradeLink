import { NextRequest } from "next/server";
import { registerController } from "@/controllers/auth/register.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(req: NextRequest) {
  try {
    return await registerController(req);
  } catch (error) {
    return handleApiError(error);
  }
}
