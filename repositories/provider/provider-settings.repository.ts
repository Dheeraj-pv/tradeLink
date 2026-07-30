import { getPrisma } from "@/lib/prisma";

export async function getProviderSettings(userId: string) {
  const prisma = getPrisma();

  return Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    }),
    prisma.providerDetails.findUnique({
      where: {
        userId,
      },
      select: {
        avgRating: true,
        reviewCount: true,
        profileImage: true,
      },
    }),
    prisma.providerCertification.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        filePath: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.providerCategory.findMany({
      where: {
        userId,
      },
      select: {
        categoryId: true,
      },
    }),
  ]);
}

export async function updateProviderProfile(
  userId: string,
  name: string,
  phone: string | null,
  categoryIds: number[],
) {
  const prisma = getPrisma();

  return prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        phone,
      },
    }),
    prisma.providerCategory.deleteMany({
      where: {
        userId,
      },
    }),
    prisma.providerCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        userId,
        categoryId,
      })),
    }),
  ]);
}

export async function findPasswordInfo(userId: string) {
  const prisma = getPrisma();

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      password: true,
      twoFactorSecret: true,
      twoFactorEnabled: true,
    },
  });
}

export async function updatePassword(userId: string, password: string) {
  const prisma = getPrisma();

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password,
      passwordVersion: {
        increment: 1,
      },
    },
  });
}

export async function deleteProviderAccount(userId: string) {
  const prisma = getPrisma();

  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
}
