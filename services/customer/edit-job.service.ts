import { AuthorizationError } from "@/lib/errors/AuthorizationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getMediaUrl } from "@/lib/minio";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as jobRepository from "@/repositories/customer/edit-job.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

interface UpdateJobInput {
  title: string;
  description: string;
  address: string;
  categoryId: number;
}

export async function getJobForEdit(id: string) {
  return withSpan("Get Job For Edit", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", id);

    logger.info(
      {
        userId: user.id,
        jobId: id,
      },
      "Fetching job for edit",
    );

    const job = await withSpan("Load Job", async () => {
      return jobRepository.findJobWithMedia(id);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId: id,
        },
        "Job not found",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.customerId !== user.id) {
      span.setAttribute("failure.reason", "forbidden");

      logger.warn(
        {
          userId: user.id,
          jobId: id,
        },
        "Unauthorized job access",
      );

      throw new AuthorizationError(ErrorCode.ACCESS_DENIED);
    }

    span.setAttribute("media.count", job.media.length);

    logger.info(
      {
        userId: user.id,
        jobId: id,
        mediaCount: job.media.length,
      },
      "Job fetched successfully",
    );

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      address: job.address,
      categoryId: job.categoryId,
      media: job.media.map((media) => ({
        id: media.id,
        url: getMediaUrl(media.filePath),
        type: media.mediaType === "IMAGE" ? "image" : "video",
      })),
    };
  });
}

export async function updateJob(
  id: string,
  data: UpdateJobInput,
) {
  return withSpan("Update Job", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", id);

    logger.info(
      {
        userId: user.id,
        jobId: id,
      },
      "Job update requested",
    );

    const job = await withSpan("Load Job", async () => {
      return jobRepository.findJob(id);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId: id,
        },
        "Job update failed: job not found",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.customerId !== user.id) {
      span.setAttribute("failure.reason", "forbidden");

      logger.warn(
        {
          userId: user.id,
          jobId: id,
        },
        "Unauthorized job update attempt",
      );

      throw new AuthorizationError(ErrorCode.ACCESS_DENIED);
    }

    const updatedJob = await withSpan("Save Job Changes", async () => {
      return jobRepository.updateJob(id, data);
    });

    logger.info(
      {
        userId: user.id,
        jobId: updatedJob.id,
      },
      "Job updated successfully",
    );

    return updatedJob;
  });
}