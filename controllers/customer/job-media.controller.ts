// controllers/customer/job-media.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  deleteJobMedia,
  getJobMedia,
  uploadJobMedia,
} from "@/services/customer/job-media.service";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// Match the actual service return types
type UploadMediaItem = {
  id: string;
  url: string;
  type: string;
};

type GetMediaItem = {
  id: string;
  url: string;
  mediaType: string;
};

type UploadMediaResponse = {
  message: string;
  data: {
    media: UploadMediaItem[];
  };
};

type DeleteMediaResponse = {
  message: string;
};

type GetMediaResponse = {
  message: string;
  data: {
    media: GetMediaItem[];
  };
};

/**
 * Upload Job Media Controller
 */
export async function uploadJobMediaController(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("UploadJobMediaController", async (span) => {
    const { id } = await params;

    logger.info("Upload job media request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      logger.warn("Upload job media: Invalid form data", { jobId: id });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const files = formData
      .getAll("media")
      .filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      logger.warn("Upload job media: No files provided", { jobId: id });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    logger.info("Upload job media files", {
      jobId: id,
      fileCount: files.length,
      fileTypes: files.map((f) => f.type),
    });

    const media = await uploadJobMedia(id, files);

    logger.info("Job media uploaded successfully", {
      jobId: id,
      mediaCount: media.length,
    });

    const response: UploadMediaResponse = {
      message: "Media uploaded successfully.",
      data: {
        media,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}

/**
 * Delete Job Media Controller
 */
export async function deleteJobMediaController(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("DeleteJobMediaController", async (span) => {
    const { id } = await params;

    logger.info("Delete job media request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      logger.warn("Delete job media: Invalid request body", { jobId: id });
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    const mediaId = (body as { mediaId?: string }).mediaId;

    if (!mediaId) {
      logger.warn("Delete job media: No mediaId provided", { jobId: id });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    logger.info("Delete job media", {
      jobId: id,
      mediaId,
    });

    await deleteJobMedia(id, mediaId);

    logger.info("Job media deleted successfully", {
      jobId: id,
      mediaId,
    });

    const response: DeleteMediaResponse = {
      message: "Media deleted successfully.",
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}

/**
 * Get Job Media Controller
 */
export async function getJobMediaController(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("GetJobMediaController", async (span) => {
    const { id } = await params;

    logger.info("Get job media request", {
      jobId: id,
    });

    span.setAttribute("job.id", id);

    const media = await getJobMedia(id);

    logger.info("Job media fetched successfully", {
      jobId: id,
      mediaCount: media.length,
    });

    const response: GetMediaResponse = {
      message: "Media fetched successfully.",
      data: {
        media,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}