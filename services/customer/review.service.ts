// services/customer/review.service.ts

import { withSpan } from "@/lib/tracing";
import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ConflictError } from "@/lib/errors/ConflictError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { sendNotification } from "@/lib/notifications";
import * as reviewRepository from "@/repositories/customer/review.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type SubmitReviewInput = {
  rating: number;
  comment?: string | null;
};

export async function submitReview(
  jobId: string,
  input: SubmitReviewInput,
) {
  return withSpan("Submit Review", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);
    span.setAttribute("review.rating", input.rating);

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Review submission requested",
    );

    const job = await withSpan("Load Job", async () => {
      return reviewRepository.findJob(jobId);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Review submission failed: job not found",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.customerId !== user.id) {
      span.setAttribute("failure.reason", "forbidden");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Unauthorized review submission attempt",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.status !== "COMPLETED") {
      span.setAttribute("failure.reason", "job_not_completed");

      logger.warn(
        {
          userId: user.id,
          jobId,
          status: job.status,
        },
        "Review submitted before job completion",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    span.setAttribute("provider.id", job.assignedProviderId!);

    const existing = await withSpan(
      "Check Existing Review",
      async () => {
        return reviewRepository.findReviewByJob(jobId);
      },
    );

    if (existing) {
      span.setAttribute("failure.reason", "review_exists");

      logger.warn(
        {
          userId: user.id,
          jobId,
          reviewId: existing.id,
        },
        "Duplicate review submission",
      );

      throw new ConflictError(ErrorCode.REVIEW_ALREADY_EXiSTS);
    }

    const review = await withSpan("Create Review", async () => {
      return reviewRepository.createReview({
        rating: input.rating,
        comment: input.comment,
        jobId,
        customerId: user.id,
        providerId: job.assignedProviderId!,
      });
    });

    await withSpan("Update Provider Rating", async () => {
      const stats = await reviewRepository.getProviderReviewStats(
        job.assignedProviderId!,
      );

      await reviewRepository.updateProviderRating(
        job.assignedProviderId!,
        stats._avg.rating ?? 0,
        stats._count.rating,
      );
    });

    await withSpan("Send Review Notification", async () => {
      await sendNotification({
        userId: job.assignedProviderId!,
        title: "New Review Received",
        message: "A customer reviewed your work.",
        type: "REVIEW_RECEIVED",
        referenceId: review.id,
      });
    });

    logger.info(
      {
        reviewId: review.id,
        jobId,
        customerId: user.id,
        providerId: job.assignedProviderId,
        rating: input.rating,
      },
      "Review submitted successfully",
    );

    return review;
  });
}