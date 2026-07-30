import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  deleteJobMedia,
  getJobMedia,
  uploadJobMedia,
} from "@/services/customer/job-media.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function uploadJobMediaController(
  req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const files = formData
    .getAll("media")
    .filter((file): file is File => file instanceof File);

  if (files.length === 0) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  const media = await uploadJobMedia(id, files);

  return NextResponse.json(
    {
      message: "Media uploaded successfully.",
      data: {
        media,
      },
    },
    {
      status: 200,
    },
  );
}

export async function deleteJobMediaController(
  req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
  }

  const mediaId = (body as { mediaId?: string }).mediaId;

  if (!mediaId) {
    throw new ValidationError(ErrorCode.INVALID_INPUT);
  }

  await deleteJobMedia(id, mediaId);

  return NextResponse.json(
    {
      message: "Media deleted successfully.",
    },
    {
      status: 200,
    },
  );
}

export async function getJobMediaController(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const { id } = await params;

  const media = await getJobMedia(id);

  return NextResponse.json(
    {
      message: "Media fetched successfully.",
      data: {
        media,
      },
    },
    {
      status: 200,
    },
  );
}
