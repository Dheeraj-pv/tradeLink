import { NextResponse } from "next/server";
import { getProviderReviews } from "@/services/provider/provider-reviews.service";

export async function getProviderReviewsController() {
  const data = await getProviderReviews();

  return NextResponse.json(
    {
      message: "Provider reviews loaded successfully.",
      data,
    },
    {
      status: 200,
    },
  );
}