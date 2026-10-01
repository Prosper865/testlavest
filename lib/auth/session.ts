import "server-only";

import { cookies } from "next/headers";
import type { Role } from "@/lib/db/schema";
import { encryptSession, SESSION_COOKIE, SESSION_DAYS } from "./session-token";

export async function createSession(userId: string, role: Role) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const token = await encryptSession({ userId, role, expiresAt: expiresAt.toISOString() });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
