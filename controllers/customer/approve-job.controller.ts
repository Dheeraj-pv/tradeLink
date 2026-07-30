import { NextRequest, NextResponse } from "next/server";
import { approveJobCompletion } from "@/services/customer/approve-job.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function approveJobCompletionController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const job = await approveJobCompletion(id);

  return NextResponse.json(
    {
      message: "Job marked as completed.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}
