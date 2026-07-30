import { NextRequest } from "next/server";
import { getJobBidsController } from "@/controllers/customer/job-bids.controller";
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
    return await getJobBidsController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}