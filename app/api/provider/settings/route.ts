import { NextRequest } from "next/server";
import {
  getProviderSettingsController,
  updateProviderSettingsController,
  deleteProviderAccountController,
} from "@/controllers/provider/provider-settings.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET() {
  try {
    return await getProviderSettingsController();
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    return await updateProviderSettingsController(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    return await deleteProviderAccountController();
  } catch (error) {
    return handleApiError(error);
  }
}
