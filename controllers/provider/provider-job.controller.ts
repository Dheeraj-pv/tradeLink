
import { NextRequest, NextResponse } from "next/server";
import { getProviderJob } from "@/services/provider/provider-job.service";

export async function getProviderJobController(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const job = await getProviderJob(id);

  return NextResponse.json(
    {
      message: "Provider job details loaded successfully.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}