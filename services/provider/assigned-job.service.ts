// services/provider/assigned-job.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { sendNotification } from "@/lib/notifications";
import { AuthorizationError } from "@/lib/errors/AuthorizationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import * as assignedJobRepository from "@/repositories/provider/assigned-job.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function getAssignedJob(jobId: string) {
  return withSpan("Get Assigned Job Details", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Provider requested assigned job details",
    );

    const job = await withSpan("Load Assigned Job", async () => {
      return assignedJobRepository.findAssignedJob(jobId, user.id);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Assigned job not found",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.assignedProviderId !== user.id) {
      span.setAttribute("failure.reason", "forbidden");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Unauthorized assigned job access",
      );

      throw new AuthorizationError(ErrorCode.ACCESS_DENIED);
    }

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Assigned job loaded successfully",
    );

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      address: job.address,
      status: job.status,
      category: job.category.name,
      customerId: job.customer.id,
      customerName: job.customer.name,
      createdAt: job.createdAt.toISOString().split("T")[0],
      agreedAmount: job.bids[0]
        ? Number(job.bids[0].amount)
        : null,
    };
  });
}

export async function startAssignedJob(jobId: string) {
  return withSpan("Start Assigned Job", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Provider requested to start assigned job",
    );

    const job = await withSpan("Load Job", async () => {
      return assignedJobRepository.findAssignedJobForUpdate(jobId);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.assignedProviderId !== user.id) {
      span.setAttribute("failure.reason", "forbidden");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Unauthorized assigned job update attempt",
      );

      throw new AuthorizationError(ErrorCode.ACCESS_DENIED);
    }

    if (job.status !== "ASSIGNED") {
      span.setAttribute("failure.reason", "invalid_job_state");

      logger.warn(
        {
          userId: user.id,
          jobId,
          currentStatus: job.status,
        },
        "Attempted to start job in invalid state",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const updated = await withSpan("Start Job", async () => {
      return assignedJobRepository.startJob(jobId);
    });

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Job started successfully",
    );

    return updated;
  });
}

export async function requestJobCompletion(jobId: string) {
  return withSpan("Request Job Completion", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Provider requested job completion",
    );

    const job = await withSpan("Load Job", async () => {
      return assignedJobRepository.findAssignedJobForUpdate(jobId);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.assignedProviderId !== user.id) {
      span.setAttribute("failure.reason", "forbidden");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Unauthorized assigned job update attempt",
      );

      throw new AuthorizationError(ErrorCode.ACCESS_DENIED);
    }

    if (job.status !== "IN_PROGRESS") {
      span.setAttribute("failure.reason", "invalid_job_state");

      logger.warn(
        {
          userId: user.id,
          jobId,
          currentStatus: job.status,
        },
        "Attempted to complete job in invalid state",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    await withSpan("Update Job Status", async () => {
      await assignedJobRepository.requestCompletion(jobId);
    });

    await withSpan("Send Completion Notification", async () => {
      await sendNotification({
        userId: job.customerId,
        title: "Job completion requested",
        message: `${user.name} has marked '${job.title}' as complete. Please confirm to release payment.`,
        type: "AWAITING_APPROVAL",
        referenceId: jobId,
      });
    });

    logger.info(
      {
        userId: user.id,
        jobId,
        customerId: job.customerId,
      },
      "Completion request sent to customer",
    );

    return {
      id: jobId,
      status: "AWAITING_APPROVAL",
    };
  });
}