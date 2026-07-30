import { NextRequest, NextResponse } from "next/server";
import {
  cancelJob,
  getCustomerJob,
} from "@/services/customer/job-details.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function getCustomerJobController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const job = await getCustomerJob(id);

  return NextResponse.json(
    {
      message: "Job loaded successfully.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}

export async function cancelJobController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const job = await cancelJob(id);

  return NextResponse.json(
    {
      message: "Job cancelled successfully.",
      data: {
        job,
      },
    },
    {
      status: 200,
    },
  );
}
