import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export async function createCertification(
  data: Prisma.ProviderCertificationUncheckedCreateInput,
) {
  const prisma = getPrisma();

  return prisma.providerCertification.create({
    data,
    select: {
      id: true,
      title: true,
      filePath: true,
    },
  });
}

export async function findOwnedCertification(
  certificationId: string,
  userId: string,
) {
  const prisma = getPrisma();

  return prisma.providerCertification.findFirst({
    where: {
      id: certificationId,
      userId,
    },
    select: {
      id: true,
    },
  });
}

export async function deleteCertification(certificationId: string) {
  const prisma = getPrisma();

  return prisma.providerCertification.delete({
    where: {
      id: certificationId,
    },
  });
}
