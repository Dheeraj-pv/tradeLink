// services/provider/provider-reviews.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { getMediaUrl } from "@/lib/minio";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as providerReviewsRepository from "@/repositories/provider/provider-reviews.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function getProviderReviews() {
  return withSpan("Get Provider Reviews", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      span.setAttribute("failure.reason", "unauthorized");

      logger.warn("Unauthenticated user attempted to access provider reviews");

      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider requested reviews",
    );

    const reviews = await withSpan("Load Reviews", async () => {
      return providerReviewsRepository.findProviderReviews(user.id);
    });

    const breakdown: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        breakdown[review.rating]++;
      }
    });

    const total = reviews.length;

    const avgRating =
      total > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
        : 0;

    const totalMedia = reviews.reduce(
      (sum, review) => sum + review.media.length,
      0,
    );

    span.setAttribute("reviews.count", total);
    span.setAttribute(
      "reviews.average_rating",
      Math.round(avgRating * 10) / 10,
    );
    span.setAttribute("reviews.media_count", totalMedia);
    span.setAttribute("reviews.1_star", breakdown[1]);
    span.setAttribute("reviews.2_star", breakdown[2]);
    span.setAttribute("reviews.3_star", breakdown[3]);
    span.setAttribute("reviews.4_star", breakdown[4]);
    span.setAttribute("reviews.5_star", breakdown[5]);

    logger.info(
      {
        userId: user.id,
        totalReviews: total,
        averageRating: Math.round(avgRating * 10) / 10,
      },
      "Provider reviews loaded successfully",
    );

    return {
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customerName: review.customer.name,
        createdAt: review.createdAt.toISOString().split("T")[0],
        media: review.media.map((media) => ({
          id: media.id,
          mediaType: media.mediaType,
          url: getMediaUrl(media.filePath),
        })),
      })),
      summary: {
        total,
        avgRating: Math.round(avgRating * 10) / 10,
        breakdown,
      },
    };
  });
}
