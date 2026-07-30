import { getPrisma } from "@/lib/prisma";

export async function findProviderBids(providerId: string) {
  const prisma = getPrisma();

  return prisma.bid.findMany({
    where: {
      providerId,
      job: {
        status: {
          not: {
            in: ["COMPLETED", "CANCELLED"],
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      job: {
        select: {
          id: true,
          title: true,
          address: true,
          status: true,
        },
      },
    },
  });
}