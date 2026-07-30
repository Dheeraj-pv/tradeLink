import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors/ValidationError";
import { getJobForEdit, updateJob } from "@/services/customer/edit-job.service";
import { z } from "zod";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export const updateJobSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  address: z.string().trim().min(1),
  categoryId: z.coerce.number().int().positive(),
});

export async function getJobForEditController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const job = await getJobForEdit(id);

  return NextResponse.json(
    {
      message: "Job fetched successfully.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}

export async function updateJobController(
  req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = updateJobSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const job = await updateJob(id, parsed.data);

  return NextResponse.json(
    {
      message: "Job updated successfully.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}
