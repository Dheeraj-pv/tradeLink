import { getPrisma } from "@/lib/prisma";

export async function findAssignedJob(jobId: string, providerId: string) {
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
      assignedProviderId: true,
      category: {
        select: {
          name: true,
        },
      },
      customer: {
        select: {
          id: true,
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

export async function findAssignedJobForUpdate(jobId: string) {
  const prisma = getPrisma();

  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      assignedProviderId: true,
      status: true,
      title: true,
      customerId: true,
    },
  });
}

export async function startJob(jobId: string) {
  const prisma = getPrisma();

  return prisma.job.update({
    where: {
      id: jobId,
    },
    data: {
      status: "IN_PROGRESS",
    },
    select: {
      id: true,
      status: true,
    },
  });
}

export async function requestCompletion(jobId: string) {
  const prisma = getPrisma();

  return prisma.job.update({
    where: {
      id: jobId,
    },
    data: {
      status: "AWAITING_APPROVAL",
    },
  });
}
