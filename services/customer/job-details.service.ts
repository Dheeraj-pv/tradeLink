import { JobStatus } from "@prisma/client";
import { AuthorizationError } from "@/lib/errors/AuthorizationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as jobRepository from "@/repositories/customer/job-details.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function getCustomerJob(id: string) {
  return withSpan("Get Customer Job Details", async (span) => {
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
      "Customer requested job details",
    );

    const job = await withSpan("Load Job", async () => {
      return jobRepository.findCustomerJobById(id, user.id);
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

    span.setAttribute("job.status", job.status);
    span.setAttribute("bids.count", job._count.bids);

    logger.info(
      {
        userId: user.id,
        jobId: id,
      },
      "Job details loaded successfully",
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

export async function cancelJob(id: string) {
  return withSpan("Cancel Job", async (span) => {
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
      "Customer requested job cancellation",
    );

    const job = await withSpan("Load Job", async () => {
      return jobRepository.findJobStatus(id);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId: id,
        },
        "Job not found during cancellation",
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
        "Unauthorized job cancellation attempt",
      );

      throw new AuthorizationError(ErrorCode.ACCESS_DENIED);
    }

    if (job.status !== JobStatus.OPEN) {
      span.setAttribute("failure.reason", "job_not_open");

      logger.warn(
        {
          userId: user.id,
          jobId: id,
          status: job.status,
        },
        "Attempted to cancel non-open job",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const updated = await withSpan("Cancel Job", async () => {
      return jobRepository.cancelJob(id);
    });

    span.setAttribute("job.status", updated.status);

    logger.info(
      {
        userId: user.id,
        jobId: id,
      },
      "Job cancelled successfully",
    );

    return updated;
  });
}
