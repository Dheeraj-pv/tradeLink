import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { getPrisma } from "@/lib/prisma";
import {
  getS3,
  JOB_MEDIA_BUCKET,
  ensureBucket,
  getMediaUrl,
} from "@/lib/minio";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ok, error } from "@/lib/api";
import { logger } from "@/lib/logger";
import { withSpan } from "@/lib/tracing";
import { PutObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";

const ALLOWED: string[] = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_FILE_SIZE: number = 5 * 1024 * 1024;

type ProviderProfileImage = Prisma.ProviderDetailsGetPayload<{
  select: {
    profileImage: true;
  };
}>;

// Given a full media URL previously returned by getMediaUrl(), recover the
// object name (path inside the bucket) so we can remove it from MinIO.
function objectNameFromUrl(url: string): string | null {
  try {
    const { pathname }: URL = new URL(url);
    const parts: string[] = pathname.split("/").filter(Boolean);

    parts.shift();

    return parts.length > 0 ? parts.join("/") : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withSpan("Upload Provider Profile Image", async (span) => {
    try {
      const user = await withSpan("Authenticate User", async () => {
        return (await getCurrentUser())!;
      });

      span.setAttribute("user.id", user.id);

      logger.info(
        {
          userId: user.id,
        },
        "Provider uploading profile image",
      );

      let formData: FormData;

      try {
        formData = await withSpan("Parse Multipart Form", async () => {
          return req.formData();
        });
      } catch {
        span.setAttribute("failure.reason", "invalid_multipart_form");

        logger.warn(
          {
            userId: user.id,
          },
          "Profile image upload failed: invalid form data",
        );

        return error("Expected multipart/form-data", 400);
      }

      const image = formData.get("image");

      if (!(image instanceof File)) {
        span.setAttribute("failure.reason", "missing_image");

        logger.warn(
          {
            userId: user.id,
          },
          "Profile image upload failed: image missing",
        );

        return error("Image required", 400);
      }

      if (!ALLOWED.includes(image.type)) {
        span.setAttribute("failure.reason", "unsupported_media_type");

        logger.warn(
          {
            userId: user.id,
            fileType: image.type,
          },
          "Profile image upload failed: unsupported image type",
        );

        return error("Unsupported image type", 400);
      }

      if (image.size > MAX_FILE_SIZE) {
        span.setAttribute("failure.reason", "file_too_large");

        logger.warn(
          {
            userId: user.id,
            fileSize: image.size,
          },
          "Profile image upload failed: image too large",
        );

        return error("Maximum image size is 5MB", 400);
      }

      const prisma = getPrisma();

      const imageUrl = await withSpan("Upload Profile Image", async () => {
        await ensureBucket();

        const ext = image.name.split(".").pop() ?? "png";
        const objectName = `profiles/${user.id}/${randomUUID()}.${ext}`;
        const buffer = Buffer.from(await image.arrayBuffer());

        await getS3().send(
  new PutObjectCommand({
    Bucket: JOB_MEDIA_BUCKET,
    Key: objectName,
    Body: buffer,
    ContentType: image.type,
    ContentLength: buffer.length,
  }),
);

        const existing: ProviderProfileImage | null =
          await prisma.providerDetails.findUnique({
            where: {
              userId: user.id,
            },
            select: {
              profileImage: true,
            },
          });

        await prisma.providerDetails.update({
          where: {
            userId: user.id,
          },
          data: {
            profileImage: objectName,
          },
        });

        if (existing?.profileImage) {
          const oldObjectName = objectNameFromUrl(existing.profileImage);

          if (oldObjectName) {
            

await getS3()
  .send(
    new DeleteObjectCommand({
      Bucket: JOB_MEDIA_BUCKET,
      Key: oldObjectName,
    }),
  )
  .catch((err: unknown) => {
    logger.warn(
      {
        userId: user.id,
        oldObjectName,
        err,
      },
      "Failed to delete previous profile image",
    );
  });
          }
        }

        span.setAttribute("profile.image_uploaded", true);

        return getMediaUrl(objectName);
      });

      logger.info(
        {
          userId: user.id,
        },
        "Profile image uploaded successfully",
      );

      return ok({
        imageUrl,
      });
    } catch (err: unknown) {
      logger.error(
        {
          err,
        },
        "Failed to upload profile image",
      );

      return error("Failed to upload image", 500);
    }
  });
}
