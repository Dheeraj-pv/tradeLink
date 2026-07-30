// services/customer/provider.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { logger } from "@/lib/logger";
import { getMediaUrl } from "@/lib/minio";
import { withSpan } from "@/lib/tracing";
import * as providerRepository from "@/repositories/customer/provider.repository";

export async function getProviderProfile(providerId: string) {
  return withSpan("Get Provider Profile", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (user) {
      span.setAttribute("user.id", user.id);
    }

    span.setAttribute("provider.id", providerId);

    logger.info(
      {
        userId: user?.id,
        providerId,
      },
      "Customer requested provider profile",
    );

    const [provider, certifications] = await withSpan(
      "Load Provider",
      async () => {
        return Promise.all([
          providerRepository.findProvider(providerId),
          providerRepository.findProviderCertifications(providerId),
        ]);
      },
    );

    if (!provider || provider.userRole !== "PROVIDER") {
      span.setAttribute("failure.reason", "provider_not_found");

      logger.warn(
        {
          userId: user?.id,
          providerId,
        },
        "Provider not found",
      );

      throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
    }

    const [reviewAgg, recentReviews] = await withSpan(
      "Load Reviews",
      async () => {
        return Promise.all([
          providerRepository.getProviderReviewStats(providerId),
          providerRepository.findRecentReviews(providerId),
        ]);
      },
    );

    span.setAttribute("reviews.count", reviewAgg._count.rating);

    const profileImageUrl = provider.providerDetails?.profileImage
      ? getMediaUrl(provider.providerDetails.profileImage)
      : null;

    logger.info(
      {
        userId: user?.id,
        providerId,
        reviewCount: reviewAgg._count.rating,
      },
      "Provider profile loaded successfully",
    );

    return {
      provider: {
        id: provider.id,
        name: provider.name,
        phone: provider.phone ?? null,
        rating: reviewAgg._avg.rating ?? 0,
        reviewCount: reviewAgg._count.rating,
        profileImage: profileImageUrl,
        certifications: certifications.map((certification) => ({
          id: certification.id,
          title: certification.title,
          url: getMediaUrl(certification.filePath),
        })),
      },

      reviews: recentReviews.map((review) => ({
        id: review.id,
        name: review.customer?.name ?? "Anonymous",
        rating: review.rating,
        comment: review.comment,
        media: review.media.map((media) => ({
          id: media.id,
          mediaType: media.mediaType,
          url: getMediaUrl(media.filePath),
        })),
      })),
    };
  });
}