import { NextRequest, NextResponse } from "next/server";
import { getJobBids } from "@/services/customer/job-bids.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function getJobBidsController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const bids = await getJobBids(id);

  return NextResponse.json(
    {
      message: "Job bids fetched successfully.",
      data: {
        bids,
      },
    },
    {
      status: 200,
    },
  );
}