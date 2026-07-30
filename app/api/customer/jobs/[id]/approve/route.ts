import { NextRequest } from "next/server";
import { approveJobCompletionController } from "@/controllers/customer/approve-job.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    return await approveJobCompletionController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}
