import { JobStatus } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as jobRepository from "@/repositories/customer/approve-job.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function approveJobCompletion(id: string) {
  return withSpan("Approve Job Completion", async (span) => {
    span.setAttribute("job.id", id);

    logger.info(
      {
        jobId: id,
      },
      "Job completion approval requested",
    );

    const job = await withSpan("Load Job", async () => {
      return jobRepository.findJobById(id);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          jobId: id,
        },
        "Job not found",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.status !== JobStatus.IN_PROGRESS) {
      span.setAttribute("failure.reason", "invalid_status");

      logger.warn(
        {
          jobId: id,
          status: job.status,
        },
        "Attempted to complete a job that is not in progress",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const updatedJob = await withSpan("Mark Job Completed", async () => {
      return jobRepository.markJobCompleted(id);
    });

    span.setAttribute("job.status", updatedJob.status);

    logger.info(
      {
        jobId: updatedJob.id,
      },
      "Job marked as completed",
    );

    return updatedJob;
  });
}
