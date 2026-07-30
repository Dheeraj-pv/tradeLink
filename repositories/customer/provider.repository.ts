import { getPrisma } from "@/lib/prisma";

export async function findProvider(providerId: string) {
  const prisma = getPrisma();
  return prisma.user.findUnique({
    where: {
      id: providerId,
    },
    include: {
      providerDetails: true,
    },
  });
}

export async function findProviderCertifications(providerId: string) {
  const prisma = getPrisma();
  return prisma.providerCertification.findMany({
    where: {
      userId: providerId,
    },
    select: {
      id: true,
      title: true,
      filePath: true,
    },
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

export async function findRecentReviews(providerId: string) {
  const prisma = getPrisma();
  return prisma.review.findMany({
    where: {
      providerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      customer: {
        select: {
          name: true,
        },
      },
      media: {
        select: {
          id: true,
          mediaType: true,
          filePath: true,
        },
      },
    },
  });
}
