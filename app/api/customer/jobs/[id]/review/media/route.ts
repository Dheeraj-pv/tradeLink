import { NextRequest } from "next/server";
import {
  getReviewMediaController,
  uploadReviewMediaController,
} from "@/controllers/customer/review-media.controller";
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
    return await uploadReviewMediaController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams,
) {
  try {
    return await getReviewMediaController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}