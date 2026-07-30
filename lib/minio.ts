// lib/s3.ts

import { S3Client } from "@aws-sdk/client-s3";

const globalForS3 = globalThis as {
  s3?: S3Client;
};

function createClient(): S3Client {
  const region = process.env.AWS_REGION;

  if (!region) {
    throw new Error("AWS_REGION is not set");
  }

  return new S3Client({
    region,
  });
}

export function getS3(): S3Client {
  if (!globalForS3.s3) {
    globalForS3.s3 = createClient();
  }

  return globalForS3.s3;
}

export const JOB_MEDIA_BUCKET = process.env.S3_BUCKET ?? "tradelink-media";

/**
 * Ensure the bucket exists.
 *
 * Not required in production because S3 buckets should be
 * created beforehand (Console, CloudFormation, Terraform, etc.).
 */
export async function ensureBucket() {
  // No-op
}

/**
 * Build the public URL for a stored object.
 *
 * Only use this if the bucket is public.
 * If the bucket is private, use pre-signed URLs instead.
 */
export function getMediaUrl(objectName: string): string {
  const region = process.env.AWS_REGION;
  return `https://${JOB_MEDIA_BUCKET}.s3.${region}.amazonaws.com/${objectName}`;
}
