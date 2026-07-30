import { NextRequest } from "next/server";
import { submitReviewController } from "@/controllers/customer/review.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  { params }: RouteParams,
) {
  try {
    return await submitReviewController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}