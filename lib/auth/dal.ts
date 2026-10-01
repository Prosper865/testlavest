import "server-only";

// Data access layer for auth. Every protected page, server action, and route handler goes
// through these helpers, which re-check the user in the database (so suspensions and role
// changes apply immediately) and return only the fields the UI needs.

import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, schema } from "@/lib/db";
import type { KycStatus, Role } from "@/lib/db/schema";
import { decryptSession, SESSION_COOKIE } from "./session-token";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  kycStatus: KycStatus | "not_started";
};

/** The signed-in, active user, or null. Memoised for the duration of a request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await decryptSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const db = await getDb();
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session.userId),
    columns: { id: true, name: true, email: true, role: true, status: true },
  });
  if (!user || user.status !== "active") return null;

  const latest = await db.query.kycSubmissions.findFirst({
    where: eq(schema.kycSubmissions.userId, user.id),
    orderBy: desc(schema.kycSubmissions.submittedAt),
    columns: { status: true },
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role, kycStatus: latest?.status ?? "not_started" };
});

/** For pages and actions that need a signed-in user. Redirects to login otherwise. */
export async function requireUser(next?: string) {
  const user = await getCurrentUser();
  if (!user) {
    // A valid cookie for a missing or suspended account must be cleared first, or the proxy
    // would bounce the visitor straight back from /login.
    const stale = await decryptSession((await cookies()).get(SESSION_COOKIE)?.value);
    redirect(stale ? "/api/auth/reset" : next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

/** For admin pages and actions. Non-admins are sent to their dashboard. */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
