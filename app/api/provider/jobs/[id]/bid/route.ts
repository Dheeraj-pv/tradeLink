import { NextRequest } from "next/server";
import { submitBidController } from "@/controllers/provider/submit-bid.controller";
import { handleApiError } from "@/lib/errors/handleApiError";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return await submitBidController(req, context);
  } catch (error) {
    return handleApiError(error);
  }
}