import { initializeTwoFactorController } from "@/controllers/auth/initialize-2fa.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST() {
  try {
    return await initializeTwoFactorController();
  } catch (error) {
    return handleApiError(error);
  }
}