import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

 

export async function findJob(jobId: string) {
  const prisma = getPrisma();
  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      customerId: true,
      assignedProviderId: true,
      status: true,
    },
  });
}

export async function findReviewByJob(jobId: string) {
  const prisma = getPrisma();
  return prisma.review.findUnique({
    where: {
      jobId,
    },
  });
}

export async function createReview(data: {
  rating: number;
  comment?: string | null;
  jobId: string;
  customerId: string;
  providerId: string;
}) {
  const prisma = getPrisma();
  return prisma.review.create({
    data,
  });
}

export async function getProviderReviewStats(providerId: string) {
  const prisma = getPrisma();
  return prisma.review.aggregate({
    where: {
      providerId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });
}

export async function updateProviderRating(
  providerId: string,
  avgRating: number,
  reviewCount: number,
) {
  const prisma = getPrisma();
  return prisma.providerDetails.update({
    where: {
      userId: providerId,
    },
    data: {
      avgRating,
      reviewCount,
    },
  });
}