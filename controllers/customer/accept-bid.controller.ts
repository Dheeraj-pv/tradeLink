import { NextRequest, NextResponse } from "next/server";
import { acceptBid } from "@/services/customer/accept-bid.service";

type RouteParams = {
  params: Promise<{
    id: string;
    bidId: string;
  }>;
};

export async function acceptBidController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id, bidId } = await params;

  await acceptBid(id, bidId);

  return NextResponse.json(
    {
      message: "Bid accepted successfully.",
    },
    {
      status: 200,
    },
  );
}
