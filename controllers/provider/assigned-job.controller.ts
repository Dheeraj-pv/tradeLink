// controllers/provider/assigned-job.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { JobStatus } from "@prisma/client";
import {
  getAssignedJob,
  startAssignedJob,
  requestJobCompletion,
} from "@/services/provider/assigned-job.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions based on what the service actually returns
type RouteParams = {
  params: Promise<{ id: string }>;
};

// Match what getAssignedJob actually returns
type JobResponse = {
  id: string;
  title: string;
  description: string;
  address: string;
  status: JobStatus;
  category: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  agreedAmount: number | null;
};

// Match what startAssignedJob returns
type StartedJobResponse = {
  id: string;
  status: JobStatus;
};

// Match what requestJobCompletion returns
type CompletedJobResponse = {
  id: string;
  status: string;
};

type GetJobResponse = {
  message: string;
  data: {
    job: JobResponse;
  };
};

type StartJobResponse = {
  message: string;
  data: {
    job: StartedJobResponse;
  };
};

type CompleteJobResponse = {
  message: string;
  data: {
    job: CompletedJobResponse;
  };
};

type PatchRequest = {
  jobId: string;
  action: "start" | "complete";
};

// Validation schema - fixed enum syntax
const patchSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  action: z.enum(["start", "complete"]),
});

/**
 * Get Assigned Job Controller
 * Retrieves a single assigned job by ID
 */
export async function getAssignedJobController(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("GetAssignedJobController", async (span) => {
    const { id } = await params;

    logger.info("Get assigned job request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    const job = await getAssignedJob(id);

    logger.info("Assigned job loaded successfully", {
      jobId: id,
      status: job?.status,
    });

    const response: GetJobResponse = {
      message: "Assigned job loaded successfully.",
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
 * Update Assigned Job Controller
 * Handles starting a job or requesting completion
 */
export async function updateAssignedJobController(
  req: NextRequest,
): Promise<NextResponse> {
  return withSpan("UpdateAssignedJobController", async (span) => {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logger.warn("Update assigned job: Invalid request body");
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Update assigned job: Validation failed", {
        errors: parsed.error.issues,
      });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const validatedData: PatchRequest = parsed.data;

    logger.info("Update assigned job request", {
      jobId: validatedData.jobId,
      action: validatedData.action,
    });

    span.setAttribute("job.id", validatedData.jobId);
    span.setAttribute("action", validatedData.action);

    if (validatedData.action === "start") {
      const job = await startAssignedJob(validatedData.jobId);

      logger.info("Job started successfully", {
        jobId: validatedData.jobId,
        status: job?.status,
      });

      const response: StartJobResponse = {
        message: "Job started successfully.",
        data: {
          job,
        },
      };

      return NextResponse.json(response, {
        status: 200,
      });
    }

    // Action: complete
    const job = await requestJobCompletion(validatedData.jobId);

    logger.info("Completion request sent successfully", {
      jobId: validatedData.jobId,
      status: job?.status,
    });

    const response: CompleteJobResponse = {
      message: "Completion request sent successfully.",
      data: {
        job,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}