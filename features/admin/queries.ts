import "server-only";

// Admin read models. Every function checks the caller is an admin before touching data,
// so they stay safe even if reused outside the admin layout.

import { and, count, desc, eq, gte, ilike, inArray, or, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import type { AccountStatus, KycStatus } from "@/lib/db/schema";

const { users, kycSubmissions, auditLog } = schema;
const DAY = 86_400_000;

// Correlated subqueries are written with explicit aliases: Drizzle renders column references
// unqualified inside single-table selects, which would compare the wrong columns.
/** Latest KYC status per user. */
const latestKycStatus = sql<KycStatus | null>`(select k.status from kyc_submissions k where k.user_id = "users"."id" order by k.submitted_at desc limit 1)`;

export async function getOverview() {
  await requireAdmin();
  const db = await getDb();
  const since = new Date(Date.now() - 14 * DAY);

  const [[totals], [newUsers], statusCounts, reviewed, recentKyc, recentActivity, signups] = await Promise.all([
    db.select({ users: count() }).from(users).where(eq(users.role, "user")),
    db.select({ value: count() }).from(users).where(and(eq(users.role, "user"), gte(users.createdAt, new Date(Date.now() - 7 * DAY)))),
    db.select({ status: kycSubmissions.status, value: count() }).from(kycSubmissions).groupBy(kycSubmissions.status),
    db.select({ submittedAt: kycSubmissions.submittedAt, reviewedAt: kycSubmissions.reviewedAt }).from(kycSubmissions)
      .where(and(inArray(kycSubmissions.status, ["approved", "rejected"]), gte(kycSubmissions.submittedAt, new Date(Date.now() - 30 * DAY)))),
    db.select({ id: kycSubmissions.id, status: kycSubmissions.status, submittedAt: kycSubmissions.submittedAt, name: users.name, email: users.email, country: kycSubmissions.country })
      .from(kycSubmissions).innerJoin(users, eq(users.id, kycSubmissions.userId)).orderBy(desc(kycSubmissions.submittedAt)).limit(6),
    listAuditRows(8),
    db.select({ createdAt: users.createdAt }).from(users).where(and(eq(users.role, "user"), gte(users.createdAt, since))),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map(row => [row.status, row.value])) as Partial<Record<KycStatus, number>>;
  const decided = (byStatus.approved ?? 0) + (byStatus.rejected ?? 0);
  const reviewHours = reviewed.filter(row => row.reviewedAt).map(row => (row.reviewedAt!.getTime() - row.submittedAt.getTime()) / 3_600_000);

  // Sign-ups per day for the last 14 days, oldest first.
  const days = Array.from({ length: 14 }, (_, index) => {
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (13 - index));
    return { date: start.getTime(), count: 0 };
  });
  for (const { createdAt } of signups) {
    const day = new Date(createdAt); day.setHours(0, 0, 0, 0);
    const bucket = days.find(item => item.date === day.getTime());
    if (bucket) bucket.count++;
  }

  return {
    totalUsers: totals.users,
    newUsers: newUsers.value,
    pending: byStatus.pending ?? 0,
    approved: byStatus.approved ?? 0,
    rejected: byStatus.rejected ?? 0,
    approvalRate: decided ? Math.round(((byStatus.approved ?? 0) / decided) * 100) : null,
    avgReviewHours: reviewHours.length ? reviewHours.reduce((a, b) => a + b, 0) / reviewHours.length : null,
    recentKyc,
    recentActivity,
    signups: days,
  };
}

export async function getPendingCount() {
  await requireAdmin();
  const db = await getDb();
  const [row] = await db.select({ value: count() }).from(kycSubmissions).where(eq(kycSubmissions.status, "pending"));
  return row.value;
}

export async function listKyc({ status, q }: { status?: KycStatus | "all"; q?: string }) {
  await requireAdmin();
  const db = await getDb();
  const search = q?.trim() ? or(ilike(users.name, `%${q.trim()}%`), ilike(users.email, `%${q.trim()}%`), ilike(kycSubmissions.legalName, `%${q.trim()}%`)) : undefined;
  const statusFilter = status && status !== "all" ? eq(kycSubmissions.status, status) : undefined;
  return db.select({
    id: kycSubmissions.id, status: kycSubmissions.status, submittedAt: kycSubmissions.submittedAt, reviewedAt: kycSubmissions.reviewedAt,
    legalName: kycSubmissions.legalName, country: kycSubmissions.country, documentType: kycSubmissions.documentType,
    userId: users.id, name: users.name, email: users.email,
  }).from(kycSubmissions).innerJoin(users, eq(users.id, kycSubmissions.userId))
    .where(and(statusFilter, search))
    // Pending first (oldest waiting at the top), then everything else newest first.
    .orderBy(sql`case when ${kycSubmissions.status} = 'pending' then 0 else 1 end`, sql`case when ${kycSubmissions.status} = 'pending' then ${kycSubmissions.submittedAt} end asc`, desc(kycSubmissions.submittedAt))
    .limit(200);
}

export async function getKycDetail(id: string) {
  await requireAdmin();
  const db = await getDb();
  const submission = await db.query.kycSubmissions.findFirst({ where: eq(kycSubmissions.id, id) });
  if (!submission) return null;
  const [user, reviewer, history] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, submission.userId), columns: { id: true, name: true, email: true, status: true, createdAt: true, lastLoginAt: true } }),
    submission.reviewedBy ? db.query.users.findFirst({ where: eq(users.id, submission.reviewedBy), columns: { name: true } }) : null,
    db.select({ id: kycSubmissions.id, status: kycSubmissions.status, submittedAt: kycSubmissions.submittedAt, reviewNote: kycSubmissions.reviewNote })
      .from(kycSubmissions).where(eq(kycSubmissions.userId, submission.userId)).orderBy(desc(kycSubmissions.submittedAt)),
  ]);
  return { submission, user, reviewerName: reviewer?.name ?? null, history };
}

export async function listUsers({ q, status, kyc }: { q?: string; status?: AccountStatus | "all"; kyc?: KycStatus | "not_started" | "all" }) {
  await requireAdmin();
  const db = await getDb();
  const search = q?.trim() ? or(ilike(users.name, `%${q.trim()}%`), ilike(users.email, `%${q.trim()}%`)) : undefined;
  const statusFilter = status && status !== "all" ? eq(users.status, status) : undefined;
  const rows = await db.select({
    id: users.id, name: users.name, email: users.email, role: users.role, status: users.status,
    createdAt: users.createdAt, lastLoginAt: users.lastLoginAt, kycStatus: latestKycStatus,
  }).from(users).where(and(search, statusFilter)).orderBy(desc(users.createdAt)).limit(300);
  const withKyc = rows.map(row => ({ ...row, kycStatus: row.kycStatus ?? ("not_started" as const) }));
  return kyc && kyc !== "all" ? withKyc.filter(row => row.kycStatus === kyc) : withKyc;
}

export async function getUserDetail(id: string) {
  const admin = await requireAdmin();
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, id), columns: { passwordHash: false } });
  if (!user) return null;
  const [submissions, activity] = await Promise.all([
    db.select({ id: kycSubmissions.id, status: kycSubmissions.status, submittedAt: kycSubmissions.submittedAt, reviewedAt: kycSubmissions.reviewedAt, reviewNote: kycSubmissions.reviewNote, country: kycSubmissions.country, documentType: kycSubmissions.documentType })
      .from(kycSubmissions).where(eq(kycSubmissions.userId, id)).orderBy(desc(kycSubmissions.submittedAt)),
    listAuditRows(25, id),
  ]);
  return { user, submissions, activity, isSelf: admin.id === id };
}

async function listAuditRows(limit: number, targetUserId?: string) {
  const db = await getDb();
  const actor = sql<string | null>`(select u.name from users u where u.id = "audit_log"."actor_id")`;
  const target = sql<string | null>`(select u.name from users u where u.id = "audit_log"."target_user_id")`;
  return db.select({ id: auditLog.id, action: auditLog.action, detail: auditLog.detail, createdAt: auditLog.createdAt, actorName: actor, targetName: target, targetUserId: auditLog.targetUserId })
    .from(auditLog).where(targetUserId ? eq(auditLog.targetUserId, targetUserId) : undefined).orderBy(desc(auditLog.createdAt)).limit(limit);
}

export async function listActivity(limit = 100) {
  await requireAdmin();
  return listAuditRows(limit);
}
