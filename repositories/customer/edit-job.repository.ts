import { getPrisma } from "@/lib/prisma";

export async function findJobWithMedia(id: string) {
  const prisma = getPrisma();
  return prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      media: true,
      category: true,
    },
  });
}

export async function findJob(id: string) {
  const prisma = getPrisma();
  return prisma.job.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      customerId: true,
    },
  });
}

export async function updateJob(
  id: string,
  data: {
    title: string;
    description: string;
    address: string;
    categoryId: number;
  },
) {
  const prisma = getPrisma();
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      title: data.title,
      description: data.description,
      address: data.address,
      categoryId: data.categoryId,
    },
  });
}
