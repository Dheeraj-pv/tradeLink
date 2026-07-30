import { getPrisma } from "@/lib/prisma";

export async function findProviderCategories(userId: string) {
  const prisma = getPrisma();

  return prisma.providerCategory.findMany({
    where: {
      userId,
    },
    select: {
      categoryId: true,
    },
  });
}

export async function getDashboardData(
  providerId: string,
  categoryIds: number[],
  skip: number,
  take: number,
) {
  const prisma = getPrisma();

  const [
    availableJobsCount,
    pendingBidsCount,
    assignedJobsCount,
    providerDetails,
    recentJobs,
    totalItems,
  ] = await Promise.all([
    prisma.job.count({
      where: {
        status: "OPEN",
        categoryId: {
          in: categoryIds,
        },
      },
    }),

    prisma.bid.count({
      where: {
        providerId,
        status: "PENDING",
      },
    }),

    prisma.job.count({
      where: {
        assignedProviderId: providerId,
        status: "ASSIGNED",
      },
    }),

    prisma.providerDetails.findUnique({
      where: {
        userId: providerId,
      },
      select: {
        avgRating: true,
        reviewCount: true,
      },
    }),

    prisma.job.findMany({
      where: {
        status: "OPEN",
        categoryId: {
          in: categoryIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
      select: {
        id: true,
        title: true,
        address: true,
        status: true,
        category: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.job.count({
      where: {
        status: "OPEN",
        categoryId: {
          in: categoryIds,
        },
      },
    }),
  ]);

  return {
    availableJobsCount,
    pendingBidsCount,
    assignedJobsCount,
    providerDetails,
    recentJobs,
    totalItems,
  };
}
