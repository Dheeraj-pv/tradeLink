import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ValidationError } from "@/lib/errors/ValidationError";
import { getProviderDashboard } from "@/services/provider/provider-dashboard.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(5),
});

export async function getProviderDashboardController(
  req: NextRequest,
) {
  const searchParams = req.nextUrl.searchParams;

  const parsed = querySchema.safeParse({
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 5,
  });

  if (!parsed.success) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const data = await getProviderDashboard(parsed.data);

  return NextResponse.json(
    {
      message: "Provider dashboard loaded successfully.",
      data,
    },
    {
      status: 200,
    },
  );
}