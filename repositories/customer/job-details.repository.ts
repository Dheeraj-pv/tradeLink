import { getPrisma } from "@/lib/prisma";

 

export async function findCustomerJobById(
  id: string,
  customerId: string,
) {
  const prisma = getPrisma();
  return prisma.job.findFirst({
    where: {
      id,
      customerId,
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

export async function findJobStatus(id: string) {
  const prisma = getPrisma();
  return prisma.job.findUnique({
    where: {
      id,
    },
    select: {
      customerId: true,
      status: true,
    },
  });
}

export async function cancelJob(id: string) {
  const prisma = getPrisma();
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
    },
    select: {
      id: true,
      status: true,
    },
  });
}