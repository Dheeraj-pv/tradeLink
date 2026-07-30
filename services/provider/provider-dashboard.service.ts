// services/provider/provider-dashboard.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as providerDashboardRepository from "@/repositories/provider/provider-dashboard.repository";

type GetProviderDashboardInput = {
  page: number;
  limit: number;
};

export async function getProviderDashboard(
  input: GetProviderDashboardInput,
) {
  return withSpan("Get Provider Dashboard", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("pagination.page", input.page);
    span.setAttribute("pagination.limit", input.limit);

    logger.info(
      {
        userId: user.id,
        page: input.page,
        limit: input.limit,
      },
      "Provider requested dashboard",
    );

    const skip = (input.page - 1) * input.limit;

    const categories = await withSpan(
      "Load Provider Categories",
      async () => {
        return providerDashboardRepository.findProviderCategories(
          user.id,
        );
      },
    );

    const categoryIds = categories.map(
      (category) => category.categoryId,
    );

    const {
      availableJobsCount,
      pendingBidsCount,
      assignedJobsCount,
      providerDetails,
      recentJobs,
      totalItems,
    } = await withSpan("Load Dashboard Data", async () => {
      return providerDashboardRepository.getDashboardData(
        user.id,
        categoryIds,
        skip,
        input.limit,
      );
    });

    const totalPages = Math.ceil(totalItems / input.limit);

    span.setAttribute(
      "dashboard.available_jobs",
      availableJobsCount,
    );
    span.setAttribute(
      "dashboard.pending_bids",
      pendingBidsCount,
    );
    span.setAttribute(
      "dashboard.assigned_jobs",
      assignedJobsCount,
    );
    span.setAttribute(
      "dashboard.review_count",
      providerDetails?.reviewCount ?? 0,
    );
    span.setAttribute(
      "dashboard.recent_jobs",
      recentJobs.length,
    );
    span.setAttribute(
      "dashboard.total_items",
      totalItems,
    );
    span.setAttribute(
      "dashboard.total_pages",
      totalPages,
    );

    logger.info(
      {
        userId: user.id,
        availableJobs: availableJobsCount,
        pendingBids: pendingBidsCount,
        assignedJobs: assignedJobsCount,
        reviewCount: providerDetails?.reviewCount ?? 0,
        totalItems,
        page: input.page,
      },
      "Provider dashboard loaded successfully",
    );

    return {
      provider: {
        name: user.name,
        avgRating: providerDetails?.avgRating ?? 0,
        reviewCount: providerDetails?.reviewCount ?? 0,
      },
      stats: {
        availableJobs: availableJobsCount,
        pendingBids: pendingBidsCount,
        assignedJobs: assignedJobsCount,
        avgRating: providerDetails?.avgRating ?? 0,
      },
      recentJobs: recentJobs.map((job) => ({
        id: job.id,
        title: job.title,
        address: job.address,
        status: job.status,
        category: job.category.name,
        customerName: job.customer.name,
      })),
      pagination: {
        page: input.page,
        limit: input.limit,
        totalItems,
        totalPages,
      },
    };
  });
}