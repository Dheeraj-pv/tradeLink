import { NextRequest } from "next/server";
import { getProviderJobController } from "@/controllers/provider/provider-job.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return await getProviderJobController(req, context);
  } catch (error) {
    return handleApiError(error);
  }
}
