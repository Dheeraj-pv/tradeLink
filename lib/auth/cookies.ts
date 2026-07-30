// lib/auth/cookies.ts
import { cookies } from "next/headers";

export const AUTH_COOKIE = "auth_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function setAuthCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true, // JS can never read this
    secure: false, // HTTPS only in prod
    sameSite: "lax", // CSRF protection
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value;
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}
