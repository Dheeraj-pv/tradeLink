// lib/auth/token.ts
import { createHash, randomBytes } from "crypto";

export function generateResetToken() {
  const rawToken = randomBytes(32).toString("hex"); // goes in the email URL
  const hashedToken = createHash("sha256").update(rawToken).digest("hex"); // goes in DB
  return { rawToken, hashedToken };
}

export function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}
