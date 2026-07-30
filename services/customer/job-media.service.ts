// services/customer/job-media.service.ts

import { randomUUID } from "crypto";
import { Readable } from "stream";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthorizationError } from "@/lib/errors/AuthorizationError";
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
import * as mediaRepository from "@/repositories/customer/job-media.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadJobMedia(jobId: string, files: File[]) {
  return withSpan("Upload Job Media", async (span) => {
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
      "Media upload requested",
    );

    const job = await withSpan("Verify Job Ownership", async () => {
      return mediaRepository.findOwnedJob(jobId, user.id);
    });

    if (!job) {
      span.setAttribute("failure.reason", "job_not_found");

      logger.warn(
        {
          userId: user.id,
          jobId,
        },
        "Media upload failed",
      );

      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    await ensureBucket();

    const uploaded = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        span.setAttribute("failure.reason", "unsupported_media_type");

        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      if (file.size > MAX_FILE_SIZE) {
        span.setAttribute("failure.reason", "file_too_large");

        throw new ValidationError(ErrorCode.INVALID_INPUT);
      }

      const ext = file.name.split(".").pop() ?? "bin";
      const objectName = `jobs/${jobId}/${randomUUID()}.${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      await withSpan("Upload Media File", async () => {
        await getS3().send(
          new PutObjectCommand({
            Bucket: JOB_MEDIA_BUCKET,
            Key: objectName,
            Body: Readable.from(buffer),
            ContentLength: buffer.byteLength,
            ContentType: file.type,
          }),
        );
      });

      const media = await withSpan("Save Media Record", async () => {
        return mediaRepository.createMedia({
          jobId,
          filePath: objectName,
          mediaType: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        });
      });

      uploaded.push({
        id: media.id,
        url: getMediaUrl(objectName),
        type: file.type.startsWith("video/") ? "video" : "image",
      });
    }

    span.setAttribute("media.uploaded", uploaded.length);

    logger.info(
      {
        userId: user.id,
        jobId,
        uploadedCount: uploaded.length,
      },
      "Media uploaded successfully",
    );

    return uploaded;
  });
}

export async function deleteJobMedia(jobId: string, mediaId: string) {
  return withSpan("Delete Job Media", async (span) => {
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
      "Media deletion requested",
    );

    const job = await mediaRepository.findOwnedJob(jobId, user.id);

    if (!job) {
      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    const media = await withSpan("Load Media", async () => {
      return mediaRepository.findMedia(mediaId);
    });

    if (!media || media.jobId !== jobId) {
      throw new NotFoundError(ErrorCode.MEDIA_NOT_FOUND);
    }

    await withSpan("Delete Media File", async () => {
      try {
        await getS3().send(
          new DeleteObjectCommand({
            Bucket: JOB_MEDIA_BUCKET,
            Key: media.filePath,
          }),
        );
      } catch (err) {
        logger.warn(
          {
            err,
            mediaId,
          },
          "Failed to delete media from storage",
        );
      }
    });

    await withSpan("Delete Media Record", async () => {
      await mediaRepository.deleteMedia(mediaId);
    });

    logger.info(
      {
        userId: user.id,
        jobId,
        mediaId,
      },
      "Media deleted successfully",
    );
  });
}

export async function getJobMedia(jobId: string) {
  return withSpan("Get Job Media", async (span) => {
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
      "Fetching job media",
    );

    const job = await mediaRepository.findOwnedJob(jobId, user.id);

    if (!job) {
      throw new NotFoundError(ErrorCode.JOB_NOT_FOUND);
    }

    const media = await withSpan("Load Media", async () => {
      return mediaRepository.findJobMedia(jobId);
    });

    span.setAttribute("media.count", media.length);

    logger.info(
      {
        userId: user.id,
        jobId,
        mediaCount: media.length,
      },
      "Fetched job media successfully",
    );

    return media.map((item) => ({
      id: item.id,
      mediaType: item.mediaType,
      url: getMediaUrl(item.filePath),
    }));
  });
}
