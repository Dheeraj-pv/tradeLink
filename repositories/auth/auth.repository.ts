import { hashBackupCode } from "@/lib/auth/backup-codes";
import { getPrisma } from "@/lib/prisma";

export async function findUserFor2FALogin(userId: string) {
  return getPrisma().user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      userRole: true,
      twoFactorSecret: true,
      passwordVersion: true,
    },
  });
}

export async function getTwoFactorSecret(userId: string) {
  return getPrisma().user.findUnique({
    where: {
      id: userId,
    },
    select: {
      twoFactorSecret: true,
    },
  });
}

export async function enableTwoFactor(userId: string, backupCodes: string[]) {
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.user.update({  
      where: {
        id: userId,
      },
      data: {
        twoFactorEnabled: true,
      },
    }),

    prisma.backupCode.createMany({
      data: backupCodes.map((code) => ({
        userId,
        code: hashBackupCode(code),
      })),
    }),
  ]);
}

export async function getTwoFactorSettings(userId: string) {
  return getPrisma().user.findUnique({
    where: {
      id: userId,
    },
    select: {
      twoFactorEnabled: true,
      twoFactorSecret: true,
    },
  });
}

export async function disableTwoFactor(userId: string) {
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    }),
    prisma.backupCode.deleteMany({
      where: {
        userId,
      },
    }),
  ]);
}
export async function storeTwoFactorSecret(
  userId: string,
  encryptedSecret: string,
) {
  await getPrisma().user.update({
    where: {
      id: userId,
    },
    data: {
      twoFactorSecret: encryptedSecret,
    },
  });
}
export async function findPasswordResetUser(email: string) {
  return getPrisma().user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function replacePasswordResetToken(
  userId: string,
  hashedToken: string,
  expiresAt: Date,
) {
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: {
        userId,
      },
    }),

    prisma.passwordResetToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    }),
  ]);
}

export async function findUserForLogin(email: string) {
  return getPrisma().user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      userRole: true,
      twoFactorEnabled: true,
      passwordVersion: true,
    },
  });
}

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: "CUSTOMER" | "PROVIDER";
  phone: string | null;
  categoryIds: number[];
}

export async function findUserByEmail(email: string) {
  return getPrisma().user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
}

export async function createUser({
  email,
  password,
  name,
  role,
  phone,
  categoryIds,
}: CreateUserInput) {
  return getPrisma().user.create({
    data: {
      email,
      password,
      name,
      userRole: role,
      phone,
      providerCategories:
        role === "PROVIDER"
          ? {
              create: categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      userRole: true,
    },
  });
}

export async function createProviderDetails(userId: string) {
  await getPrisma().providerDetails.create({
    data: {
      userId,
    },
  });
}

export async function findPasswordResetToken(hashedToken: string) {
  return getPrisma().passwordResetToken.findUnique({
    where: {
      token: hashedToken,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      user: {
        select: {
          twoFactorEnabled: true,
          twoFactorSecret: true,
        },
      },
    },
  });
}

export async function validatePasswordResetToken(hashedToken: string) {
  return getPrisma().passwordResetToken.findUnique({
    where: {
      token: hashedToken,
    },
    select: {
      expiresAt: true,
      user: {
        select: {
          twoFactorEnabled: true,
        },
      },
    },
  });
}

export async function deletePasswordResetToken(tokenId: string) {
  await getPrisma().passwordResetToken.delete({
    where: {
      id: tokenId,
    },
  });
}

export async function resetPassword(userId: string, hashedPassword: string) {
  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        passwordVersion: {
          increment: 1,
        },
      },
    }),

    prisma.passwordResetToken.deleteMany({
      where: {
        userId,
      },
    }),
  ]);
}
