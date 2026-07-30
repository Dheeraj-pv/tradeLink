import { NextRequest, NextResponse } from "next/server";
import { createBidSchema } from "@/lib/bid/schemas";
import { ValidationError } from "@/lib/errors/ValidationError";
import { submitBid } from "@/services/provider/submit-bid.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

export async function submitBidController(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const parsed = createBidSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const bid = await submitBid(id, parsed.data);

  return NextResponse.json(
    {
      message: "Bid submitted successfully.",
      data: {
        bid,
      },
    },
    {
      status: 201,
    },
  );
}
