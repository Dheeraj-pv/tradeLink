import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getAssignedJob,
  startAssignedJob,
  requestJobCompletion,
} from "@/services/provider/assigned-job.service";
import { ValidationError } from "@/lib/errors/ValidationError";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const patchSchema = z.object({
  jobId: z.string().min(1),
  action: z.enum(["start", "complete"]),
});

export async function getAssignedJobController(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const job = await getAssignedJob(id);

  return NextResponse.json(
    {
      message: "Assigned job loaded successfully.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}

export async function updateAssignedJobController(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  if (parsed.data.action === "start") {
    const job = await startAssignedJob(parsed.data.jobId);

    return NextResponse.json(
      {
        message: "Job started successfully.",
        data: {
          job,
        },
      },
      {
        status: 200,
      },
    );
  }

  const job = await requestJobCompletion(parsed.data.jobId);

  return NextResponse.json(
    {
      message: "Completion request sent successfully.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}
