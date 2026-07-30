import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function findJob(jobId: string) {
  const prisma = getPrisma();

  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      id: true,
      status: true,
      customerId: true,
    },
  });
}

export async function findExistingBid(
  providerId: string,
  jobId: string,
) {
  const prisma = getPrisma();

  return prisma.bid.findFirst({
    where: {
      providerId,
      jobId,
    },
  });
}

export async function createBid(
  data: Prisma.BidUncheckedCreateInput,
) {
  const prisma = getPrisma();

  return prisma.bid.create({
    data,
  });
}