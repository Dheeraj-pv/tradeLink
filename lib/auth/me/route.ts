// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookies";
import { safeVerifyToken } from "@/lib/auth/jwt";
import { findUserById } from "@/lib/auth/user-store";

export async function GET() {
  const token = await getAuthCookie();

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const payload = await safeVerifyToken(token);
  if (!payload) {
    // expired or tampered token
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userRole,
      },
    },
    { status: 200 },
  );
}
