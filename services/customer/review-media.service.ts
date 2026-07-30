// services/customer/review-media.service.ts

import { randomUUID } from "crypto";
import { Readable } from "stream";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import {
  ensureBucket,
  getMediaUrl,
  getS3,
  JOB_MEDIA_BUCKET,
} from "@/lib/minio";
import { withSpan } from "@/lib/tracing";
import * as reviewMediaRepository from "@/repositories/customer/review-media.repository";
import { MediaType } from "@prisma/client";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const ALLOWED: Record<string, "IMAGE" | "VIDEO"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
};

const MAX_SIZE = 10 * 1024 * 1024;

export async function uploadReviewMedia(jobId: string, files: File[]) {
  return withSpan("Upload Review Media", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Review media upload requested",
    );

    const review = await withSpan("Load Review", async () => {
      return reviewMediaRepository.findReview(jobId);
    });

    if (!review) {
      span.setAttribute("failure.reason", "review_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Review media upload failed: review not found",
      );

      throw new NotFoundError(ErrorCode.REVIEW_NOT_FOUND);
    }

    if (review.customerId !== user.id) {
      span.setAttribute("failure.reason", "forbidden");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Unauthorized review media upload attempt",
      );

      throw new NotFoundError(ErrorCode.REVIEW_NOT_FOUND);
    }

    for (const file of files) {
      if (!ALLOWED[file.type]) {
        span.setAttribute("failure.reason", "unsupported_media_type");

        logger.warn(
          {
            userId: user.id,
            jobId,
            fileType: file.type,
          },
          "Unsupported review media type",
        );

        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      if (file.size > MAX_SIZE) {
        span.setAttribute("failure.reason", "file_too_large");

        logger.warn(
          {
            userId: user.id,
            jobId,
            fileName: file.name,
            fileSize: file.size,
          },
          "Review media exceeds size limit",
        );

        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }
    }

    await ensureBucket();

    const uploaded: {
      id: string;
      mediaType: MediaType;
      url: string;
    }[] = [];

    await withSpan("Upload Media", async () => {
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "bin";

        const objectName = `reviews/${review.id}/${randomUUID()}.${ext}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        await getS3().send(
          new PutObjectCommand({
            Bucket: JOB_MEDIA_BUCKET,
            Key: objectName,
            Body: Readable.from(buffer),
            ContentLength: buffer.byteLength,
            ContentType: file.type,
          }),
        );

        const media = await reviewMediaRepository.createMedia({
          reviewId: review.id,
          mediaType: ALLOWED[file.type],
          filePath: objectName,
        });

        uploaded.push({
          id: media.id,
          mediaType: media.mediaType,
          url: getMediaUrl(media.filePath),
        });
      }
    });

    span.setAttribute("media.uploaded", uploaded.length);

    logger.info(
      {
        userId: user.id,
        jobId,
        uploadedCount: uploaded.length,
      },
      "Review media uploaded successfully",
    );

    return uploaded;
  });
}

export async function getReviewMedia(jobId: string) {
  return withSpan("Get Review Media", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return (await getCurrentUser())!;
    });

    span.setAttribute("user.id", user.id);
    span.setAttribute("job.id", jobId);

    logger.info(
      {
        userId: user.id,
        jobId,
      },
      "Fetching review media",
    );

    const review = await withSpan("Load Review", async () => {
      return reviewMediaRepository.findOwnedReview(jobId, user.id);
    });

    if (!review) {
      span.setAttribute("failure.reason", "review_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Review media fetch failed",
      );

      throw new NotFoundError(ErrorCode.REVIEW_NOT_FOUND);
    }

    const media = await withSpan("Load Media", async () => {
      return reviewMediaRepository.findReviewMedia(review.id);
    });

    span.setAttribute("media.count", media.length);

    logger.info(
      {
        userId: user.id,
        jobId,
        mediaCount: media.length,
      },
      "Review media fetched successfully",
    );

    return media.map((item) => ({
      id: item.id,
      mediaType: item.mediaType,
      url: getMediaUrl(item.filePath),
    }));
  });
}
