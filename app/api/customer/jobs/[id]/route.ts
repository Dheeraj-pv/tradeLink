import { NextRequest } from "next/server";
import {
  cancelJobController,
  getCustomerJobController,
} from "@/controllers/customer/job-details.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    return await getCustomerJobController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    return await cancelJobController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}
