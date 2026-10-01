import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import { paymentSummary, reviewPlanPayment, submitPlanPayment } from "../features/payments/plan-payment-service";
import { receiptType } from "../features/payments/receipt";

const client = new PGlite();
const db = drizzle(client, { schema });
try {
  await migrate(db, { migrationsFolder: "./migrations" });
  const userId = crypto.randomUUID(), otherId = crypto.randomUUID(), adminId = crypto.randomUUID();
  for (const [id, role] of [[userId, "user"], [otherId, "user"], [adminId, "admin"]] as const) {
    await db.insert(schema.users).values({ id, name: role, email: `${id}@example.test`, role, passwordHash: "test-only", createdAt: new Date() });
  }
  const plan = (await db.select().from(schema.investmentPlans))[0];
  const method = (await db.select().from(schema.paymentMethods))[0];
  const screenshot = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jYxkAAAAASUVORK5CYII=", "base64");
  assert.equal(receiptType(screenshot), "image/png");
  assert.equal(receiptType(Buffer.from("<svg onload='alert(1)'/>")), null);
  assert.equal(receiptType(Buffer.from("not-an-image")), null);
  const input = { id: crypto.randomUUID(), planId: plan.id, methodId: method.id, amount: plan.minInvestment, address: "DEMO-ADDRESS", screenshotKey: "receipts/test.png", screenshotType: "image/png" };
  await assert.rejects(submitPlanPayment(db, userId, input), /no longer available/);
  await db.update(schema.paymentMethods).set({ address: input.address }).where(eq(schema.paymentMethods.id, method.id));
  await assert.rejects(submitPlanPayment(db, userId, { ...input, amount: plan.minInvestment - 1 }), /investment limits/);
  await assert.rejects(submitPlanPayment(db, userId, { ...input, amount: (plan.maxInvestment ?? 100_000_000) + 1 }), /investment limits/);
  await assert.rejects(submitPlanPayment(db, userId, { ...input, address: "OLD-ADDRESS" }), /address has changed/);
  const id = await submitPlanPayment(db, userId, input);
  assert.equal(await submitPlanPayment(db, userId, input), id, "Retries must be idempotent");
  assert.equal(await submitPlanPayment(db, userId, { ...input, id: crypto.randomUUID() }), id, "Only one pending submission per plan");
  assert.equal((await paymentSummary(db, userId)).approvedAmount, 0);
  assert.equal((await paymentSummary(db, otherId)).payments.length, 0);
  await assert.rejects(submitPlanPayment(db, otherId, input), /Invalid submission/);
  assert.equal(await reviewPlanPayment(db, userId, id, "approved", ""), false, "Users cannot review payments");
  assert.equal(await reviewPlanPayment(db, adminId, id, "approved", "Verified demo screenshot"), true);
  assert.equal(await reviewPlanPayment(db, adminId, id, "approved", ""), false, "Approval cannot credit twice");
  assert.equal(await reviewPlanPayment(db, adminId, id, "rejected", ""), false, "Completed reviews cannot change");
  assert.equal((await paymentSummary(db, userId)).approvedAmount, input.amount);
  const rejectedId = await submitPlanPayment(db, userId, { ...input, id: crypto.randomUUID() });
  assert.equal(await reviewPlanPayment(db, adminId, rejectedId, "rejected", "Please upload a clear screenshot"), true);
  assert.equal((await paymentSummary(db, userId)).approvedAmount, input.amount, "Rejections must not affect balance");
  const resubmittedId = await submitPlanPayment(db, userId, { ...input, id: crypto.randomUUID() });
  assert.notEqual(resubmittedId, rejectedId, "Rejected payments can be resubmitted");
  await db.update(schema.paymentMethods).set({ address: "NEW-DEMO-ADDRESS" }).where(eq(schema.paymentMethods.id, method.id));
  await db.delete(schema.investmentPlans).where(eq(schema.investmentPlans.id, plan.id));
  const summary = await paymentSummary(db, userId);
  assert.equal(summary.approvedAmount, input.amount, "Editing or deleting a plan cannot erase approved balances");
  assert.ok(summary.payments.every(payment => payment.planName === plan.name && payment.address === input.address));
  assert.ok(summary.payments.every(payment => !("screenshotKey" in payment)), "Summary must not expose receipt storage keys");
  const receipt = await db.query.planPayments.findFirst({ where: eq(schema.planPayments.id, id) });
  assert.equal(receipt!.screenshotKey, input.screenshotKey);
  await migrate(db, { migrationsFolder: "./migrations" });
  assert.equal((await paymentSummary(db, userId)).approvedAmount, input.amount);
  console.log("Plan payment checks passed: limits, unavailable wallets, stale addresses, receipt types, idempotency, admin review, account isolation, rejection/resubmission, durable balance, and receipt persistence.");
} finally { client.close(); }
