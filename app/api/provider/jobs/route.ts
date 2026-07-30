import { NextRequest } from "next/server";
import { getProviderDashboardController } from "@/controllers/provider/provider-dashboard.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET(req: NextRequest) {
  try {
    return await getProviderDashboardController(req);
  } catch (error) {
    return handleApiError(error);
  }
}