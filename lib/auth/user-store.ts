// lib/auth/user-store.ts

import { getPrisma } from "@/lib/prisma";

export type UserRole = "CUSTOMER" | "PROVIDER";

export async function findUserByEmail(email: string) {
  const prisma = getPrisma();
  return prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
}

export async function findUserById(id: string) {
  const prisma = getPrisma();
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function createUser(input: {
  email: string;
  password: string; // already hashed
  name: string;
  role: UserRole;
  phone?: string;
}) {
  const existing = await findUserByEmail(input.email);

  if (existing) {
    throw new Error("A user with this email already exists");
  }
  const prisma = getPrisma();
  return prisma.user.create({
    data: {
      email: input.email.toLowerCase(),

      password: input.password,

      name: input.name,

      userRole: input.role,

      phone: input.phone,
    },
  });
}
