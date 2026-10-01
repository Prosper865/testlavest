import "server-only";

import { getDb, schema } from "@/lib/db";

export type AuditAction =
  | "user.signup" | "user.login" | "user.login_failed"
  | "kyc.submitted" | "kyc.approved" | "kyc.rejected"
  | "user.suspended" | "user.reactivated" | "user.role_changed";

export async function recordAudit(action: AuditAction, options: { actorId?: string | null; targetUserId?: string | null; detail?: string } = {}) {
  const db = await getDb();
  await db.insert(schema.auditLog).values({
    id: crypto.randomUUID(),
    action,
    actorId: options.actorId ?? null,
    targetUserId: options.targetUserId ?? null,
    detail: options.detail ?? null,
    createdAt: new Date(),
  });
}
