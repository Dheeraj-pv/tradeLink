import { NextRequest } from "next/server";
import { acceptBidController } from "@/controllers/customer/accept-bid.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

type RouteParams = {
  params: Promise<{
    id: string;
    bidId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    return await acceptBidController(req, { params });
  } catch (error) {
    return handleApiError(error);
  }
}
