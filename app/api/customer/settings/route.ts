import { NextRequest } from "next/server";
import {
  deleteCustomerSettingsController,
  getCustomerSettingsController,
  updateCustomerSettingsController,
} from "@/controllers/customer/customer-settings.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET() {
  try {
    return await getCustomerSettingsController();
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    return await updateCustomerSettingsController(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    return await deleteCustomerSettingsController();
  } catch (error) {
    return handleApiError(error);
  }
}