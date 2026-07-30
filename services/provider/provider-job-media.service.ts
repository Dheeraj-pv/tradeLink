// services/provider/provider-job-media.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { getMediaUrl } from "@/lib/minio";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as providerJobMediaRepository from "@/repositories/provider/provider-job-media.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function getProviderJobMedia(jobId: string) {
  return withSpan("Get Provider Job Media", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      span.setAttribute("failure.reason", "unauthorized");

      logger.warn(
        "Unauthenticated user attempted to access provider job media",
      );

      throw new Error("Unauthorized");
    }

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Provider requested job media",
    );

    const job = await withSpan("Load Job", async () => {
      return providerJobMediaRepository.findJob(jobId);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Job not found while loading media",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    const media = await withSpan("Load Media", async () => {
      return providerJobMediaRepository.findJobMedia(jobId);
    });

    span.setAttribute("media.count", media.length);

    logger.info(
      {
        userId: user.id,
        jobId,
        mediaCount: media.length,
      },
      "Job media loaded successfully",
    );

    return media.map((item) => ({
      id: item.id,
      mediaType: item.mediaType,
      url: getMediaUrl(item.filePath),
    }));
  });
}
