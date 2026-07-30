import { getPrisma } from "@/lib/prisma";

export async function findProviderReviews(providerId: string) {
  const prisma = getPrisma();

  return prisma.review.findMany({
    where: {
      providerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: {
          name: true,
        },
      },
      media: {
        select: {
          id: true,
          mediaType: true,
          filePath: true,
        },
      },
    },
  });
}
