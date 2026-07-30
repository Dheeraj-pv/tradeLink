import { NextRequest } from "next/server";
import {
  getAssignedJobController,
  updateAssignedJobController,
} from "@/controllers/provider/assigned-job.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return await getAssignedJobController(req, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    return await updateAssignedJobController(req);
  } catch (error) {
    return handleApiError(error);
  }
}
