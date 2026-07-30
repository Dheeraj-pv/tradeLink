import crypto from "crypto";
import { getPrisma } from "@/lib/prisma";

export function generateBackupCodes(count = 8) {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(5).toString("hex"),
  );
}

export function hashBackupCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function verifyBackupCode(
  userId: string,
  code: string,
): Promise<boolean> {
  const prisma = getPrisma();
  const hashed = hashBackupCode(code);
  const backupCode = await prisma.backupCode.findFirst({
    where: { userId, code: hashed, used: false },
  });

  if (!backupCode) return false;

  await prisma.backupCode.update({
    where: { id: backupCode.id },
    data: { used: true },
  });

  return true;
}
