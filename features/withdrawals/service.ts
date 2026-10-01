import { and, desc, eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/types";
import * as schema from "@/lib/db/schema";
import type { WithdrawalInput } from "./validation";

const { withdrawals, users, auditLog } = schema;

/** One query gives a consistent view of credits, debits, and reserved requests. */
export async function withdrawalBalance(db: Pick<Database, "select">, userId: string) {
  const [totals] = await db.select({
    profitCents: users.profitCents,
    spentCents: users.portfolioSpentCents,
    portfolioJson: users.portfolioJson,
    portfolioVersion: users.portfolioVersion,
    approvedCents: sql<number>`coalesce((select sum(amount) * 100 from plan_payments where user_id = ${userId} and status = 'approved'), 0)`.mapWith(Number),
    sentCents: sql<number>`coalesce((select sum(amount_cents) from withdrawals where user_id = ${userId} and status = 'sent'), 0)`.mapWith(Number),
    pendingCents: sql<number>`coalesce((select sum(amount_cents) from withdrawals where user_id = ${userId} and status = 'pending'), 0)`.mapWith(Number),
  }).from(users).where(eq(users.id, userId));
  const { approvedCents = 0, profitCents = 0, spentCents = 0, sentCents = 0, pendingCents = 0, portfolioJson = null, portfolioVersion = 0 } = totals ?? {};
  return { approvedCents, profitCents, spentCents, sentCents, pendingCents, portfolioJson, portfolioVersion, balanceCents: approvedCents + profitCents - spentCents - sentCents, availableCents: approvedCents + profitCents - spentCents - sentCents - pendingCents };
}

/** Postgres runs transactions concurrently: lock the user row so balance checks and the writes
 * that depend on them are serialized per user. */
export async function lockUser(tx: Pick<Database, "select">, userId: string) {
  await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).for("update");
}

export async function withdrawalHistory(db: Database, userId: string) {
  // Full bank details are not sent to the periodically refreshed account summary.
  const rows = await db.select({
    id: withdrawals.id, amountCents: withdrawals.amountCents, bankName: withdrawals.bankName,
    accountLast4: sql<string>`right(${withdrawals.accountNumber}, 4)`, status: withdrawals.status,
    submittedAt: withdrawals.submittedAt, reviewedAt: withdrawals.reviewedAt, reviewNote: withdrawals.reviewNote,
  }).from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.submittedAt));
  return rows.map(row => ({ ...row, submittedAt: row.submittedAt.toISOString(), reviewedAt: row.reviewedAt?.toISOString() ?? null }));
}

export class WithdrawalError extends Error {}

export async function requestWithdrawal(db: Database, userId: string, input: WithdrawalInput) {
  return db.transaction(async tx => {
    await lockUser(tx, userId);
    const user = await tx.query.users.findFirst({ where: and(eq(users.id, userId), eq(users.role, "user"), eq(users.status, "active")) });
    if (!user) throw new WithdrawalError("Only an active user account can request a withdrawal.");
    const previous = await tx.query.withdrawals.findFirst({ where: eq(withdrawals.id, input.id) });
    if (previous) {
      if (previous.userId !== userId) throw new WithdrawalError("Invalid withdrawal request. Refresh and try again.");
      return previous.id;
    }
    const balance = await withdrawalBalance(tx, userId);
    if (!Number.isSafeInteger(input.amount) || input.amount < 1 || input.amount > balance.availableCents) {
      throw new WithdrawalError("The amount exceeds your available balance. Pending withdrawal requests are already reserved.");
    }
    const { amount, ...details } = input;
    await tx.insert(withdrawals).values({ ...details, userId, amountCents: amount, submittedAt: new Date() });
    await tx.insert(auditLog).values({ id: crypto.randomUUID(), actorId: userId, targetUserId: userId,
      action: "withdrawal.requested", detail: `$${(amount / 100).toFixed(2)}`, createdAt: new Date() });
    return input.id;
  });
}

/** The status transition and audit share one transaction. The sent total is the debit;
 * there is no second balance write to fail or be applied twice. */
export async function reviewWithdrawal(db: Database, adminId: string, id: string, decision: "sent" | "rejected", note: string) {
  return db.transaction(async tx => {
    const admin = await tx.query.users.findFirst({ where: and(eq(users.id, adminId), eq(users.role, "admin"), eq(users.status, "active")) });
    if (!admin) throw new WithdrawalError("Only an active admin can review withdrawals.");
    const withdrawal = await tx.query.withdrawals.findFirst({ where: eq(withdrawals.id, id) });
    if (!withdrawal || withdrawal.status !== "pending") return false;
    await lockUser(tx, withdrawal.userId);
    if (decision === "sent") {
      const balance = await withdrawalBalance(tx, withdrawal.userId);
      if (withdrawal.amountCents > balance.balanceCents) throw new WithdrawalError("This user no longer has enough balance to mark this request as sent.");
    }
    const updated = await tx.update(withdrawals).set({ status: decision, reviewedAt: new Date(), reviewedBy: adminId, reviewNote: note || null })
      .where(and(eq(withdrawals.id, id), eq(withdrawals.status, "pending"))).returning({ id: withdrawals.id });
    if (!updated.length) return false;
    await tx.insert(auditLog).values({ id: crypto.randomUUID(), actorId: adminId, targetUserId: withdrawal.userId,
      action: `withdrawal.${decision}`, detail: `$${(withdrawal.amountCents / 100).toFixed(2)}`, createdAt: new Date() });
    return true;
  });
}
