// lib/auth/get-current-user.ts
// Use in Server Components and Route Handlers to read the session.
//
// Example in a Server Component:
//   const user = await getCurrentUser();
//   if (!user) redirect("/login");

import { getAuthCookie } from "./cookies";
import { safeVerifyToken } from "./jwt";
import { getPrisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await safeVerifyToken(token);
  if (!payload) return null;
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      userRole: true,
      phone: true,
    },
  });

  return user ?? null;
}
