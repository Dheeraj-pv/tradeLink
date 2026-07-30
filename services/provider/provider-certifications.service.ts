// services/provider/provider-certifications.service.ts

import { randomUUID } from "crypto";
import { Readable } from "stream";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ConflictError } from "@/lib/errors/ConflictError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { logger } from "@/lib/logger";
import { ensureBucket, getS3, JOB_MEDIA_BUCKET } from "@/lib/minio";
import { withSpan } from "@/lib/tracing";
import * as providerCertificationsRepository from "@/repositories/provider/provider-certifications.repository";
import { ErrorCode } from "@/lib/errors/ErrorCode";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadProviderCertification(formData: FormData) {
  return withSpan("Upload Provider Certification", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      span.setAttribute("failure.reason", "unauthorized");

      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider uploading certification",
    );

    const title = formData.get("title");
    const file = formData.get("image");

    if (typeof title !== "string" || title.trim() === "") {
      span.setAttribute("failure.reason", "missing_title");

      logger.warn(
        {
          userId: user.id,
        },
        "Certification upload failed: missing title",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    if (!(file instanceof File)) {
      span.setAttribute("failure.reason", "missing_image");

      logger.warn(
        {
          userId: user.id,
        },
        "Certification upload failed: image missing",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    if (!ALLOWED.includes(file.type)) {
      span.setAttribute("failure.reason", "unsupported_media_type");

      logger.warn(
        {
          userId: user.id,
          fileType: file.type,
        },
        "Certification upload failed: unsupported image type",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    if (file.size > MAX_FILE_SIZE) {
      span.setAttribute("failure.reason", "file_too_large");

      logger.warn(
        {
          userId: user.id,
          fileSize: file.size,
        },
        "Certification upload failed: image too large",
      );

      throw new ValidationError(ErrorCode.INVALID_INPUT);
    }

    const certification = await withSpan("Upload Certification", async () => {
      await ensureBucket();

      const ext = file.name.split(".").pop() ?? "png";
      const objectName = `certifications/${user.id}/${randomUUID()}.${ext}`;

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

      return providerCertificationsRepository.createCertification({
        userId: user.id,
        title: title.trim(),
        filePath: objectName,
      });
    });

    span.setAttribute("certification.id", certification.id);

    logger.info(
      {
        userId: user.id,
        certificationId: certification.id,
        title: certification.title,
      },
      "Certification uploaded successfully",
    );

    return certification;
  });
}

export async function deleteProviderCertification(certificationId: string) {
  return withSpan("Delete Provider Certification", async (span) => {
    const user = await withSpan("Authenticate User", async () => {
      return await getCurrentUser();
    });

    if (!user) {
      span.setAttribute("failure.reason", "unauthorized");

      throw new AuthenticationError(ErrorCode.INVALID_CREDENTIALS);
    }

    span.setAttribute("user.id", user.id);

    logger.info(
      {
        userId: user.id,
      },
      "Provider deleting certification",
    );

    const certification = await withSpan("Load Certification", async () => {
      return providerCertificationsRepository.findOwnedCertification(
        certificationId,
        user.id,
      );
    });

    if (!certification) {
      span.setAttribute("failure.reason", "certification_not_found");

      logger.warn(
        {
          userId: user.id,
          certificationId,
        },
        "Certification delete failed: not found",
      );

      throw new ConflictError(ErrorCode.CERTIFICTAION_NOT_FOUND);
    }

    await withSpan("Delete Certification", async () => {
      await providerCertificationsRepository.deleteCertification(
        certificationId,
      );
    });

    span.setAttribute("certification.id", certification.id);

    logger.info(
      {
        userId: user.id,
        certificationId,
      },
      "Certification deleted successfully",
    );
  });
}
