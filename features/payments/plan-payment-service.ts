import { and, desc, eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/types";
import * as schema from "@/lib/db/schema";
import { withdrawalBalance, withdrawalHistory } from "@/features/withdrawals/service";
import { type PortfolioState } from "@/features/portfolio/model";

const payments = schema.planPayments;

// Never include receipt bytes in lists or in client component props.
export const paymentColumns = {
  id: payments.id, userId: payments.userId, planId: payments.planId, planName: payments.planName,
  amount: payments.amount, methodName: payments.methodName, network: payments.network,
  address: payments.address, status: payments.status, submittedAt: payments.submittedAt,
  reviewedAt: payments.reviewedAt, reviewNote: payments.reviewNote,
};

export async function paymentSummary(db: Database, userId: string) {
  const rows = await db.select(paymentColumns).from(payments)
    .where(eq(payments.userId, userId)).orderBy(desc(payments.submittedAt));
  const [balance, withdrawals] = await Promise.all([withdrawalBalance(db, userId), withdrawalHistory(db, userId)]);
  return {
    approvedAmount: rows.reduce((total, row) => total + (row.status === "approved" ? row.amount : 0), 0),
    balanceAmount: balance.balanceCents / 100,
    profitAmount: balance.profitCents / 100,
    sentWithdrawalAmount: balance.sentCents / 100,
    pendingWithdrawalAmount: balance.pendingCents / 100,
    availableWithdrawalAmount: balance.availableCents / 100,
    portfolioVersion: balance.portfolioVersion,
    portfolio: JSON.parse(balance.portfolioJson ?? JSON.stringify({ holdings: {}, crypto: {}, plans: [], reservations: [], activity: [] })) as Pick<PortfolioState, "holdings" | "crypto" | "plans" | "reservations" | "activity">,
    withdrawals,
    payments: rows.map(row => ({ ...row, submittedAt: row.submittedAt.toISOString(), reviewedAt: row.reviewedAt?.toISOString() ?? null })),
  };
}

export type PlanPaymentSummary = Awaited<ReturnType<typeof paymentSummary>>;

export async function submitPlanPayment(db: Database, userId: string, input: {
  id: string; planId: string; methodId: string; amount: number; address: string;
  screenshotKey: string; screenshotType: string;
}) {
  return db.transaction(async tx => {
    const existing = await tx.select({ id: payments.id, userId: payments.userId }).from(payments).where(eq(payments.id, input.id));
    if (existing.length) {
      if (existing[0].userId !== userId) throw new Error("Invalid submission. Refresh and try again.");
      return existing[0].id;
    }
    const plan = await tx.query.investmentPlans.findFirst({ where: and(eq(schema.investmentPlans.id, input.planId), eq(schema.investmentPlans.visible, true)) });
    if (!plan) throw new Error("This plan is no longer available.");
    if (!Number.isSafeInteger(input.amount) || input.amount < plan.minInvestment || input.amount > (plan.maxInvestment ?? 100_000_000)) {
      throw new Error("Choose an amount within this plan’s investment limits.");
    }
    const method = await tx.query.paymentMethods.findFirst({ where: eq(schema.paymentMethods.id, input.methodId) });
    if (!method?.address.trim()) throw new Error("This payment method is no longer available.");
    if (method.address !== input.address) throw new Error("The receiving address has changed. Refresh the page before submitting.");
    const pending = await tx.select({ id: payments.id }).from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.planId, input.planId), eq(payments.status, "pending")));
    if (pending.length) return pending[0].id;
    await tx.insert(payments).values({
      id: input.id, userId, planId: plan.id, planName: plan.name, amount: input.amount,
      methodName: method.name, network: method.network, address: method.address,
      screenshotKey: input.screenshotKey, screenshotType: input.screenshotType, submittedAt: new Date(),
    });
    await tx.insert(schema.auditLog).values({ id: crypto.randomUUID(), actorId: userId, targetUserId: userId,
      action: "plan_payment.submitted", detail: `${plan.name}: $${input.amount}`, createdAt: new Date() });
    return input.id;
  });
}

/** A conditional transition makes repeat clicks and competing reviews harmless. The balance
 * is the sum of approved records, so there is no second credit operation to repeat or lose. */
export async function reviewPlanPayment(db: Database, adminId: string, id: string, decision: "approved" | "rejected", note: string) {
  return db.transaction(async tx => {
    const [payment] = await tx.update(payments).set({ status: decision, reviewedAt: new Date(), reviewedBy: adminId, reviewNote: note || null })
      .where(and(eq(payments.id, id), eq(payments.status, "pending"), sql`exists (select 1 from users where id = ${adminId} and role = 'admin' and status = 'active')`))
      .returning({ userId: payments.userId, planName: payments.planName, amount: payments.amount });
    if (!payment) return false;
    await tx.insert(schema.auditLog).values({ id: crypto.randomUUID(), actorId: adminId, targetUserId: payment.userId,
      action: `plan_payment.${decision}`, detail: `${payment.planName}: $${payment.amount}`, createdAt: new Date() });
    return true;
  });
}
