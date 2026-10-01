// Signed session tokens (JWT, HS256). Imported by the proxy and by server code, so no
// Node-only or "server-only" imports here. The payload holds only the user id and role.

import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/lib/db/schema";

export const SESSION_COOKIE = "session";
export const SESSION_DAYS = 7;

export type SessionPayload = { userId: string; role: Role; expiresAt: string };

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters (see .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || (payload.role !== "user" && payload.role !== "admin")) return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
