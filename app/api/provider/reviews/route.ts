import { NextResponse } from "next/server";
import { getProviderReviewsController } from "@/controllers/provider/provider-reviews.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function GET() {
  try {
    return await getProviderReviewsController();
  } catch (error) {
    return handleApiError(error);
  }
}