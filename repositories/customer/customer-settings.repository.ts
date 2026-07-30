import { getPrisma } from "@/lib/prisma";



export async function findProfile(userId: string) {
  const prisma = getPrisma();
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      twoFactorEnabled: true,
    },
  });
}

export async function updateProfile(
  userId: string,
  name: string,
  phone: string | null,
) {
  const prisma = getPrisma();
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      phone,
    },
  });
}

export async function findPasswordDetails(userId: string) {
  const prisma = getPrisma();
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      password: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
    },
  });
}

export async function updatePassword(
  userId: string,
  password: string,
) {
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

export async function deleteAccount(userId: string) {
  const prisma = getPrisma();
  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
}