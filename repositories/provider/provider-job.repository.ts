import { getPrisma } from "@/lib/prisma";

export async function findJob(jobId: string) {
  const prisma = getPrisma();

  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      address: true,
      status: true,
      createdAt: true,
      customerId: true,
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });
}
