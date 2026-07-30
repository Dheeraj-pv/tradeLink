import { JobStatus } from "@prisma/client";
import { AuthorizationError } from "@/lib/errors/AuthorizationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logger } from "@/lib/logger";
import { sendNotification } from "@/lib/notifications";
import { withSpan } from "@/lib/tracing";
import * as bidRepository from "@/repositories/customer/accept-bid.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";
export async function acceptBid(jobId: string, bidId: string) {
  return withSpan("Accept Bid", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);
    span.setAttribute("bid.id", bidId);

    logger.info(
      {
        userId: user.id,
        jobId,
        bidId,
      },
      "Bid acceptance requested",
    );

    const job = await withSpan("Load Job", async () => {
      return bidRepository.findJobWithBids(jobId);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Bid acceptance failed: job not found",
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
        "Unauthorized bid acceptance attempt",
      );

      throw new AuthorizationError(ErrorCode.ACCESS_DENIED);
    }

    if (job.status !== JobStatus.OPEN) {
      span.setAttribute("failure.reason", "job_not_open");

      logger.warn(
        {
          userId: user.id,
          jobId,
          status: job.status,
        },
        "Bid acceptance failed: job already assigned",
      );

     throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const acceptedBid = job.bids.find((bid) => bid.id === bidId);

    if (!acceptedBid) {
      span.setAttribute("failure.reason", "bid_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
          bidId,
        },
        "Bid acceptance failed: bid not found",
      );

      throw new NotFoundError(ErrorCode.BID_NOT_FOUND);
    }

    span.setAttribute("provider.id", acceptedBid.providerId);

    await withSpan("Assign Job", async () => {
      await bidRepository.acceptBidTransaction(
        jobId,
        bidId,
        acceptedBid.providerId,
      );
    });

    await withSpan("Send Assignment Notification", async () => {
      await sendNotification({
        userId: acceptedBid.providerId,
        title: "New Job Assigned",
        message: "You have been assigned a job",
        type: "JOB_ASSIGNED",
        referenceId: jobId,
      });
    });

    logger.info(
      {
        userId: user.id,
        jobId,
        bidId,
        providerId: acceptedBid.providerId,
      },
      "Bid accepted successfully",
    );
  });
}