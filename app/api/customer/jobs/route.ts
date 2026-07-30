import { NextRequest } from "next/server";
import {
  createJobController,
  getCustomerJobsController,
} from "@/controllers/customer/job.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET(req: NextRequest) {
  try {
    return await getCustomerJobsController(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    return await createJobController(req);
  } catch (error) {
    return handleApiError(error);
  }
}