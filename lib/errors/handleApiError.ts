import { NextResponse } from "next/server";
import { AppError } from "./AppError";
import { logger } from "@/lib/logger";
import { ErrorCode } from "./ErrorCode";



export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        code: error.code,
      },
      {
        status: error.statusCode,
      },
    );
  }

  logger.error({ error }, "Unhandled API error");

  return NextResponse.json(
    {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    },
    {
      status: 500,
    },
  );
}