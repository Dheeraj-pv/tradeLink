// controllers/provider/submit-bid.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { createBidSchema } from "@/lib/bid/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { submitBid } from "@/services/provider/submit-bid.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions
type RouteParams = {
  params: Promise<{ id: string }>;
};

// Match what the service expects (message is required)
type SubmitBidRequest = {
  amount: number;
  message: string;
};

// Use Prisma's Decimal type - it will be serialized by the service
type BidResponse = {
  id: string;
  amount: any; // Prisma Decimal type
  status: string;
  createdAt: Date;
  updatedAt: Date;
  jobId: string;
  providerId: string;
  message: string | null;
};

type SubmitBidResponse = {
  message: string;
  data: {
    bid: BidResponse;
  };
};

/**
 * Submit Bid Controller
 * Submits a bid on a job by a provider
 */
export async function submitBidController(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("SubmitBidController", async (span) => {
    const { id } = await params;

    logger.info("Submit bid request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logger.warn("Submit bid: Invalid request body", { jobId: id });
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    const parsed = createBidSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Submit bid: Validation failed", {
        jobId: id,
        errors: parsed.error.issues,
      });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const validatedData: SubmitBidRequest = parsed.data;

    logger.info("Submit bid data", {
      jobId: id,
      amount: validatedData.amount,
      hasMessage: !!validatedData.message,
    });

    const bid = await submitBid(id, validatedData);

    logger.info("Bid submitted successfully", {
      jobId: id,
      bidId: bid.id,
      amount: bid.amount,
      status: bid.status,
    });

    const response: SubmitBidResponse = {
      message: "Bid submitted successfully.",
      data: {
        bid,
      },
    };

    return NextResponse.json(response, {
      status: 201,
    });
  });
}