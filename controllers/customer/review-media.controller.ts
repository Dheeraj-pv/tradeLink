// controllers/customer/review-media.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { ErrorCode } from "@/lib/errors/ErrorCode";
import { ValidationError } from "@/lib/errors/ValidationError";
import {
  getReviewMedia,
  uploadReviewMedia,
} from "@/services/customer/review-media.service";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";

// Type definitions
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// Match what the service actually returns
type MediaItem = {
  id: string;
  url: string;
  mediaType: string;
};

type UploadMediaResponse = {
  message: string;
  data: {
    media: MediaItem[];
  };
};

type GetMediaResponse = {
  message: string;
  data: {
    media: MediaItem[];
  };
};

/**
 * Upload Review Media Controller
 */
export async function uploadReviewMediaController(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("UploadReviewMediaController", async (span) => {
    const { id } = await params;

    logger.info("Upload review media request", {
      reviewId: id,
    });

    span.setAttribute("review.id", id);

    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      logger.warn("Upload review media: Invalid form data", { reviewId: id });
      throw new ValidationError(ErrorCode.INVALID_REQUEST_BODY);
    }

    const files = formData
      .getAll("media")
      .filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      logger.warn("Upload review media: No files provided", { reviewId: id });
      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    logger.info("Upload review media files", {
      reviewId: id,
      fileCount: files.length,
      fileTypes: files.map((f) => f.type),
    });

    const media = await uploadReviewMedia(id, files);

    logger.info("Review media uploaded successfully", {
      reviewId: id,
      mediaCount: media.length,
    });

    const response: UploadMediaResponse = {
      message: "Review media uploaded successfully.",
      data: {
        media,
      },
    };

    return NextResponse.json(response, {
      status: 201,
    });
  });
}

/**
 * Get Review Media Controller
 */
export async function getReviewMediaController(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return withSpan("GetReviewMediaController", async (span) => {
    const { id } = await params;

    logger.info("Get review media request", {
      reviewId: id,
    });

    span.setAttribute("review.id", id);

    const media = await getReviewMedia(id);

    logger.info("Review media fetched successfully", {
      reviewId: id,
      mediaCount: media.length,
    });

    const response: GetMediaResponse = {
      message: "Review media fetched successfully.",
      data: {
        media,
      },
    };

    return NextResponse.json(response, {
      status: 200,
    });
  });
}