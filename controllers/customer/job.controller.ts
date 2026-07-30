import { NextRequest, NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";
import { ValidationError } from "@/lib/errors/ValidationError";
import { createJobSchema } from "@/lib/job/schemas";
import { createJob, getCustomerJobs } from "@/services/customer/job.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function getCustomerJobsController(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 5);
  const status = searchParams.get("status");

  const result = await getCustomerJobs({
    page,
    limit,
    status:
      status && status !== "ALL" && status in JobStatus
        ? (status as JobStatus)
        : undefined,
  });

  return NextResponse.json(
    {
      message: "Jobs fetched successfully.",
      data: result,
    },
    {
      status: 200,
    },
  );
}

export async function createJobController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = createJobSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const job = await createJob(parsed.data);

  return NextResponse.json(
    {
      message: "Job created successfully.",
      data: job,
    },
    {
      status: 201,
    },
  );
}
