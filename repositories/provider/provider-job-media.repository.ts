import { getPrisma } from "@/lib/prisma";

export async function findJob(jobId: string) {
  const prisma = getPrisma();

  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      id: true,
    },
  });
}

export async function findJobMedia(jobId: string) {
  const prisma = getPrisma();

  return prisma.jobMedia.findMany({
    where: {
      jobId,
    },
    select: {
      id: true,
      mediaType: true,
      filePath: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}