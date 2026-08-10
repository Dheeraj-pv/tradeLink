// controllers/customer/review.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { createReviewSchema } from "@/lib/review/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { submitReview } from "@/services/customer/review.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// Match what the schema allows (comment can be optional/nullable)
type SubmitReviewRequest = {
  rating: number;
  comment?: string | null;
};

// Match what the service actually returns
type ReviewResponse = {
  id: string;
  rating: number;
  comment: string | null;
  customerId: string;
  providerId: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
};

type SubmitReviewResponse = {
  message: string;
  data: {
    review: ReviewResponse;
  };
};

/**
 * Submit Review Controller
 * Submits a review for a completed job
 */
export async function submitReviewController(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("SubmitReviewController", async (span) => {
    const { id } = await params;

    logger.info("Submit review request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logger.warn("Submit review: Invalid request body", { jobId: id });
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Submit review: Validation failed", {
        jobId: id,
        errors: parsed.error.issues,
      });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const validatedData: SubmitReviewRequest = parsed.data;

    logger.info("Submit review data", {
      jobId: id,
      rating: validatedData.rating,
      hasComment: !!validatedData.comment,
    });

    const review = await submitReview(id, validatedData);

    logger.info("Review submitted successfully", {
      jobId: id,
      reviewId: review.id,
      rating: review.rating,
    });

    const response: SubmitReviewResponse = {
      message: "Review submitted successfully.",
      data: {
        review,
      },
    };

    return NextResponse.json(response, {
      status: 201,
    });
  });
}