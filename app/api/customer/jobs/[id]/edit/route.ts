import { NextRequest } from "next/server";
import {
  getJobForEditController,
  updateJobController,
} from "@/controllers/customer/edit-job.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams,
) {
  try {
    return await getJobForEditController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
) {
  try {
    return await updateJobController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}