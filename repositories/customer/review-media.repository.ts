import { MediaType } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

 

export async function findReview(jobId: string) {
  const prisma = getPrisma();
  return prisma.review.findUnique({
    where: {
      jobId,
    },
    select: {
      id: true,
      customerId: true,
    },
  });
}

export async function findOwnedReview(
  jobId: string,
  customerId: string,
) {
  const prisma = getPrisma();
  return prisma.review.findFirst({
    where: {
      jobId,
      customerId,
    },
    select: {
      id: true,
    },
  });
}

export async function createMedia(data: {
  reviewId: string;
  mediaType: MediaType;
  filePath: string;
}) {
  const prisma = getPrisma();
  return prisma.reviewMedia.create({
    data,
    select: {
      id: true,
      mediaType: true,
      filePath: true,
    },
  });
}

export async function findReviewMedia(reviewId: string) {
  const prisma = getPrisma();
  return prisma.reviewMedia.findMany({
    where: {
      reviewId,
    },
    select: {
      id: true,
      mediaType: true,
      filePath: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}