import { getPrisma } from "@/lib/prisma";

export async function findJobWithBids(jobId: string) {
  const prisma = getPrisma();
  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    include: {
      bids: true,
    },
  });
}

export async function acceptBidTransaction(
  jobId: string,
  bidId: string,
  providerId: string,
) {
  const prisma = getPrisma();
  return prisma.$transaction([
    prisma.bid.update({
      where: {
        id: bidId,
      },
      data: {
        status: "ACCEPTED",
      },
    }),

    prisma.bid.updateMany({
      where: {
        jobId,
        id: {
          not: bidId,
        },
      },
      data: {
        status: "REJECTED",
      },
    }),

    prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: "ASSIGNED",
        assignedProviderId: providerId,
      },
    }),
  ]);
}
