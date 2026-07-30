import { NextRequest, NextResponse } from "next/server";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  getReviewMedia,
  uploadReviewMedia,
} from "@/services/customer/review-media.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function uploadReviewMediaController(
  req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const files = formData
    .getAll("media")
    .filter((file): file is File => file instanceof File);

  if (files.length === 0) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const media = await uploadReviewMedia(id, files);

  return NextResponse.json(
    {
      message: "Review media uploaded successfully.",
      data: {
        media,
      },
    },
    {
      status: 201,
    },
  );
}

export async function getReviewMediaController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const media = await getReviewMedia(id);

  return NextResponse.json(
    {
      message: "Review media fetched successfully.",
      data: {
        media,
      },
    },
    {
      status: 200,
    },
  );
}