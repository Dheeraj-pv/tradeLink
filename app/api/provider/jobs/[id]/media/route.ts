import { NextRequest } from "next/server";
import { getProviderJobMediaController } from "@/controllers/provider/provider-job-media.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  context: RouteParams,
) {
  try {
    return await getProviderJobMediaController(req, context);
  } catch (error) {
    return handleApiError(error);
  }
}