import { SignJWT, jwtVerify, type JWTPayload } from "jose";

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return new TextEncoder().encode(secret);
}
const EXPIRES_IN = "7d";

export interface AuthTokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "CUSTOMER" | "PROVIDER"; // matches your UserRole enum exactly
  passwordVersion: number;
}

export async function signToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecretKey());
  return payload as AuthTokenPayload;
}

// Returns null instead of throwing — safe for use in middleware
export async function safeVerifyToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

import jwt from "jsonwebtoken";

interface PendingTokenPayload {
  userId: string;
  stage: "2fa_pending";
}

function getPendingJwtSecret() {
  const secret = process.env.JWT_PENDING_SECRET;

  if (!secret) {
    throw new Error("JWT_PENDING_SECRET is not set in environment variables");
  }

  return secret;
}

export async function signPendingToken(payload: { userId: string }) {
  return jwt.sign(
    { userId: payload.userId, stage: "2fa_pending" },
    getPendingJwtSecret(),
    { expiresIn: "5m" },
  );
}

export async function verifyPendingToken(
  token: string,
): Promise<PendingTokenPayload | null> {
  try {
    const decoded = jwt.verify(
      token,
      getPendingJwtSecret(),
    ) as PendingTokenPayload;
    if (decoded.stage !== "2fa_pending") return null;
    return decoded;
  } catch {
    return null;
  }
}
