import { JobStatus, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

 

export async function findCustomerJobs(
  where: Prisma.JobWhereInput,
  skip: number,
  take: number,
) {
  const prisma = getPrisma();
  return prisma.job.findMany({
    where,
    select: {
      id: true,
      title: true,
      status: true,
      address: true,
      createdAt: true,
      _count: {
        select: {
          bids: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });
}

export async function countCustomerJobs(
  customerId: string,
  where: Prisma.JobWhereInput,
) {
  const prisma = getPrisma();
  const [
    openJobs,
    assignedJobs,
    completedJobs,
    totalJobs,
    inProgressJobs,
    totalItems,
  ] = await Promise.all([
    prisma.job.count({
      where: {
        customerId,
        status: JobStatus.OPEN,
      },
    }),

    prisma.job.count({
      where: {
        customerId,
        status: JobStatus.ASSIGNED,
      },
    }),

    prisma.job.count({
      where: {
        customerId,
        status: JobStatus.COMPLETED,
      },
    }),

    prisma.job.count({
      where: {
        customerId,
      },
    }),

    prisma.job.count({
      where: {
        customerId,
        status: JobStatus.IN_PROGRESS,
      },
    }),

    prisma.job.count({
      where,
    }),
  ]);

  return {
    openJobs,
    assignedJobs,
    completedJobs,
    totalJobs,
    inProgressJobs,
    totalItems,
  };
}

export async function createCustomerJob(data: {
  title: string;
  description: string;
  address: string;
  categoryId: number;
  customerId: string;
}) {
  const prisma = getPrisma();
  return prisma.job.create({
    data,
  });
}