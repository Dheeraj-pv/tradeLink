import { getPrisma } from "@/lib/prisma";

export async function findAssignedJobs(providerId: string) {
  const prisma = getPrisma();
  return prisma.job.findMany({
    where: {
      assignedProviderId: providerId,
      status: {
        in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "AWAITING_APPROVAL"],
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
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
      bids: {
        where: {
          providerId,
          status: "ACCEPTED",
        },
        select: {
          amount: true,
        },
        take: 1,
      },
    },
  });
}
