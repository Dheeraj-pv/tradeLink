// services/provider/provider-job.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as providerJobRepository from "@/repositories/provider/provider-job.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function getProviderJob(jobId: string) {
  return withSpan("Get Provider Job Details", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return getCurrentUser();
    });

    span.setAttribute("job.id", jobId);

    if (user) {
      span.setAttribute("user.id", user.id);
    } else {
      span.setAttribute("failure.reason", "unauthenticated");
    }

    logger.info(
      {
        userId: user?.id,
        jobId,
      },
      "Provider requested job details",
    );

    const job = await withSpan("Load Job", async () => {
      return providerJobRepository.findJob(jobId);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user?.id,
          jobId,
        },
        "Requested job not found",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    span.setAttribute("job.status", job.status);
    span.setAttribute("job.bid_count", job._count.bids);

    logger.info(
      {
        userId: user?.id,
        jobId,
        status: job.status,
      },
      "Provider job details loaded successfully",
    );

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      address: job.address,
      status: job.status,
      category: job.category.name,
      bidCount: job._count.bids,
      createdAt: job.createdAt.toISOString().split("T")[0],
    };
  });
}
