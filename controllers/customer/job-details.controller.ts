// controllers/customer/job-details.controller.ts
import { NextRequest, NextResponse } from "next/server";
import {
  cancelJob,
  getCustomerJob,
} from "@/services/customer/job-details.service";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type JobDetailsResponse = {
  message: string;
  data: {
    job: {
      id: string;
      title: string;
      description: string;
      address: string;
      status: string;
      category: string;
      bidCount: number;
      createdAt: string;
      customerName?: string;
      providerName?: string;
      agreedAmount?: number | null;
    };
  };
};

type CancelJobResponse = {
  message: string;
  data: {
    job: {
      id: string;
      status: string;
    };
  };
};

/**
 * Get Customer Job Controller
 * Retrieves job details for a customer
 */
export async function getCustomerJobController(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("GetCustomerJobController", async (span) => {
    const { id } = await params;

    logger.info("Get customer job request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    const job = await getCustomerJob(id);

    logger.info("Customer job loaded successfully", {
      jobId: id,
      status: job?.status,
    });

    const response: JobDetailsResponse = {
      message: "Job loaded successfully.",
      data: {
        job,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}

/**
 * Cancel Job Controller
 * Cancels a customer's job
 */
export async function cancelJobController(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("CancelJobController", async (span) => {
    const { id } = await params;

    logger.info("Cancel job request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    const job = await cancelJob(id);

    logger.info("Job cancelled successfully", {
      jobId: id,
      status: job?.status,
    });

    const response: CancelJobResponse = {
      message: "Job cancelled successfully.",
      data: {
        job,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}