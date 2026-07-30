// services/provider/submit-bid.service.ts

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ConflictError } from "@/lib/errors/ConflictError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import { sendNotification } from "@/lib/notifications";
import { withSpan } from "@/lib/tracing";
import * as submitBidRepository from "@/repositories/provider/submit-bid.repository";
import type { createBidSchema } from "@/lib/bid/schemas";
import { z } from "zod";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type CreateBidInput = z.infer<typeof createBidSchema>;

export async function submitBid(
  jobId: string,
  { amount, message }: CreateBidInput,
) {
  return withSpan("Submit Bid", async (span) => {
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
      "Provider submitting bid",
    );

    const job = await withSpan("Load Job", async () => {
      return submitBidRepository.findJob(jobId);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Bid failed: job not found",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    if (job.status !== "OPEN") {
      span.setAttribute("failure.reason", "job_closed");

      logger.warn(
        {
          userId: user.id,
          jobId,
          status: job.status,
        },
        "Bid failed: job is not open",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const existingBid = await withSpan("Check Existing Bid", async () => {
      return submitBidRepository.findExistingBid(user.id, jobId);
    });

    if (existingBid) {
      span.setAttribute("failure.reason", "duplicate_bid");

      logger.warn(
        {
          userId: user.id,
          jobId,
          bidId: existingBid.id,
        },
        "Bid failed: provider already placed a bid",
      );

      throw new ConflictError(ErrorCode.BID_ALREADY_EXISTS);
    }

    const bid = await withSpan("Create Bid", async () => {
      return submitBidRepository.createBid({
        amount,
        message,
        providerId: user.id,
        jobId,
      });
    });

    span.setAttribute("bid.id", bid.id);

    await withSpan("Send Bid Notification", async () => {
      await sendNotification({
        userId: job.customerId,
        title: "New comment",
        message: `Provider '${user.name}' placed a bid on your job`,
        type: "BID_RECEIVED",
        referenceId: job.id,
      });
    });

    logger.info(
      {
        userId: user.id,
        jobId,
        bidId: bid.id,
        amount,
      },
      "Bid submitted successfully",
    );

    return bid;
  });
}
