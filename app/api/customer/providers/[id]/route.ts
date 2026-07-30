import { NextRequest } from "next/server";
import { getProviderProfileController } from "@/controllers/customer/provider.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    return await getProviderProfileController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}
