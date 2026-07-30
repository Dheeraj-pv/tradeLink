import { getPrisma } from "@/lib/prisma";



export async function findJobById(id: string) {
  const prisma = getPrisma();
  return prisma.job.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
    },
  });
}

export async function markJobCompleted(id: string) {
  const prisma = getPrisma();
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      status: "COMPLETED",
    },
    select: {
      id: true,
      status: true,
    },
  });
}