import { NextRequest, NextResponse } from "next/server";
import { createReviewSchema } from "@/lib/review/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { submitReview } from "@/services/customer/review.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function submitReviewController(
  req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = createReviewSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const review = await submitReview(id, parsed.data);

  return NextResponse.json(
    {
      message: "Review submitted successfully.",
      data: {
        review,
      },
    },
    {
      status: 201,
    },
  );
}