import { MediaType } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export async function findOwnedJob(jobId: string, customerId: string) {
  const prisma = getPrisma();
  return prisma.job.findFirst({
    where: {
      id: jobId,
      customerId,
    },
    select: {
      id: true,
    },
  });
}

export async function createMedia(data: {
  jobId: string;
  filePath: string;
  mediaType: MediaType;
}) {
  const prisma = getPrisma();
  return prisma.jobMedia.create({
    data,
    select: {
      id: true,
      filePath: true,
      mediaType: true,
    },
  });
}

export async function findMedia(mediaId: string) {
  const prisma = getPrisma();
  return prisma.jobMedia.findUnique({
    where: {
      id: mediaId,
    },
    select: {
      id: true,
      jobId: true,
      filePath: true,
    },
  });
}

export async function deleteMedia(mediaId: string) {
  const prisma = getPrisma();
  return prisma.jobMedia.delete({
    where: {
      id: mediaId,
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
