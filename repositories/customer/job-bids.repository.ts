import { getPrisma } from "@/lib/prisma";

 

export async function findJobBids(jobId: string) {
  const prisma = getPrisma();
  return prisma.bid.findMany({
    where: {
      jobId,
    },
    orderBy: {
      amount: "asc",
    },
    select: {
      id: true,
      amount: true,
      message: true,
      status: true,
      provider: {
        select: {
          id: true,
          name: true,
          providerDetails: {
            select: {
              avgRating: true,
              reviewCount: true,
            },
          },
          providerCategories: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
            take: 1,
          },
        },
      },
    },
  });
}