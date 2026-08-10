// controllers/customer/job.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";
import { ValidationError } from "@/lib/errors/ValidationError";
import { createJobSchema } from "@/lib/job/schemas";
import { createJob, getCustomerJobs } from "@/services/customer/job.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions
type GetJobsQuery = {
  page: number;
  limit: number;
  status?: JobStatus;
};

// Match what getCustomerJobs actually returns
type GetJobsResult = {
  jobs: Array<{
    id: string;
    title: string;
    status: JobStatus;
    address: string;
    createdAt: Date;
    bidCount: number;
  }>;
  stats: {
    openJobs: number;
    assignedJobs: number;
    completedJobs: number;
    totalJobs: number;
    inProgressJobs: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalItems: number; // Fixed: service uses totalItems
    totalPages: number;
  };
};

type GetJobsResponse = {
  message: string;
  data: GetJobsResult;
};

type CreateJobRequest = {
  title: string;
  description: string;
  address: string;
  categoryId: number;
  budget?: number;
};

// Match what createJob actually returns
type CreateJobResult = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  assignedProviderId: string | null;
};

type CreateJobResponse = {
  message: string;
  data: CreateJobResult;
};

/**
 * Get Customer Jobs Controller
 */
export async function getCustomerJobsController(
  req: NextRequest,
): Promise<NextResponse> {
  return withSpan("GetCustomerJobsController", async (span) => {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 5);
    const status = searchParams.get("status");

    const query: GetJobsQuery = {
      page,
      limit,
      status:
        status && status !== "ALL" && status in JobStatus
          ? (status as JobStatus)
          : undefined,
    };

    logger.info("Get customer jobs request", {
      page: query.page,
      limit: query.limit,
      status: query.status || "ALL",
    });

    span.setAttribute("page", query.page);
    span.setAttribute("limit", query.limit);
    span.setAttribute("status", query.status || "ALL");

    const result = await getCustomerJobs(query);

    logger.info("Customer jobs fetched successfully", {
      total: result.pagination?.totalItems || 0,
      returned: result.jobs?.length || 0,
    });

    const response: GetJobsResponse = {
      message: "Jobs fetched successfully.",
      data: result,
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}

/**
 * Create Job Controller
 */
export async function createJobController(
  req: NextRequest,
): Promise<NextResponse> {
  return withSpan("CreateJobController", async (span) => {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logger.warn("Create job: Invalid request body");
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Create job: Validation failed", {
        errors: parsed.error.issues,
      });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const validatedData: CreateJobRequest = parsed.data;

    logger.info("Create job request", {
      title: validatedData.title,
      categoryId: validatedData.categoryId,
      hasBudget: !!validatedData.budget,
    });

    span.setAttribute("categoryId", validatedData.categoryId);
    span.setAttribute("hasBudget", !!validatedData.budget);

    const job = await createJob(validatedData);

    logger.info("Job created successfully", {
      jobId: job.id,
      title: job.title,
    });

    const response: CreateJobResponse = {
      message: "Job created successfully.",
      data: job,
    };

    return NextResponse.json(response, {
      status: 201,
    });
  });
}