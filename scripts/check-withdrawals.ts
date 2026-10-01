import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import { paymentSummary } from "../features/payments/plan-payment-service";
import { requestWithdrawal, reviewWithdrawal, withdrawalBalance, withdrawalHistory } from "../features/withdrawals/service";
import { withdrawalAmount, withdrawalSchema } from "../features/withdrawals/validation";

const client = new PGlite();
const db = drizzle(client, { schema });
try {
  await migrate(db, { migrationsFolder: "./migrations" });
  const userId = crypto.randomUUID(), otherId = crypto.randomUUID(), adminId = crypto.randomUUID();
  for (const [id, role] of [[userId, "user"], [otherId, "user"], [adminId, "admin"]] as const) {
    await db.insert(schema.users).values({ id, name: role, email: `${id}@example.test`, role, passwordHash: "test-only", createdAt: new Date() });
  }
  await db.insert(schema.planPayments).values({ id: crypto.randomUUID(), userId, planName: "Demo starter", amount: 100,
    methodName: "Demo wallet", network: "Demo", address: "DEMO", screenshotKey: "test-receipt", screenshotType: "image/png", status: "approved", submittedAt: new Date() });
  const raw = { id: crypto.randomUUID(), amount: "25.37", beneficiaryName: "Demo Recipient", accountNumber: "0012345678", routingNumber: "000000000", bankName: "Demo Bank", recipientAddress: "123 Example Street", bankAddress: "456 Example Street" };
  const input = withdrawalSchema.parse(raw);
  assert.equal(input.amount, 2537);
  assert.equal(input.accountNumber, "0012345678", "Leading zeroes must be retained");
  assert.equal(withdrawalAmount.parse("0.29"), 29);
  for (const amount of ["", "0", "-1", "1.001", "NaN", "Infinity", "1e3", "100000001"]) assert.equal(withdrawalAmount.safeParse(amount).success, false);
  assert.equal(withdrawalSchema.safeParse({ ...raw, routingNumber: "123", bankName: " " }).success, false);
  assert.equal((await withdrawalBalance(db, userId)).balanceCents, 10000);
  await assert.rejects(requestWithdrawal(db, otherId, input), /exceeds/);
  await assert.rejects(requestWithdrawal(db, adminId, input), /active user/);
  const id = await requestWithdrawal(db, userId, input);
  assert.equal(await requestWithdrawal(db, userId, input), id, "Retry must not add another request");
  await assert.rejects(requestWithdrawal(db, otherId, input), /Invalid withdrawal/);
  let balance = await withdrawalBalance(db, userId);
  assert.equal(balance.balanceCents, 10000, "Pending requests must not deduct balance");
  assert.equal(balance.availableCents, 7463, "Pending amount is reserved");
  await assert.rejects(requestWithdrawal(db, userId, { ...input, id: crypto.randomUUID(), amount: 8000 }), /exceeds/);
  await assert.rejects(reviewWithdrawal(db, userId, id, "sent", ""), /active admin/);
  await db.update(schema.users).set({ status: "suspended" }).where(eq(schema.users.id, adminId));
  await assert.rejects(reviewWithdrawal(db, adminId, id, "sent", ""), /active admin/);
  await db.update(schema.users).set({ status: "active" }).where(eq(schema.users.id, adminId));
  await client.exec("CREATE OR REPLACE FUNCTION fail_withdrawal_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test rollback'; END $$; CREATE TRIGGER fail_withdrawal_audit BEFORE INSERT ON audit_log FOR EACH ROW WHEN (NEW.action = 'withdrawal.sent') EXECUTE FUNCTION fail_withdrawal_audit();");
  await assert.rejects(reviewWithdrawal(db, adminId, id, "sent", ""));
  assert.equal((await withdrawalBalance(db, userId)).balanceCents, 10000, "Failed audit must roll back the debit");
  assert.equal((await withdrawalHistory(db, userId))[0].status, "pending");
  await client.exec("DROP TRIGGER fail_withdrawal_audit ON audit_log");
  assert.equal(await reviewWithdrawal(db, adminId, id, "sent", "Demo sent"), true);
  assert.equal(await reviewWithdrawal(db, adminId, id, "sent", ""), false, "Repeated sent action cannot debit twice");
  assert.equal(await reviewWithdrawal(db, adminId, id, "rejected", ""), false, "Completed requests cannot be reversed");
  balance = await withdrawalBalance(db, userId);
  assert.equal(balance.balanceCents, 7463);
  assert.equal(balance.pendingCents, 0);
  const rejectId = await requestWithdrawal(db, userId, { ...input, id: crypto.randomUUID(), amount: 1000 });
  assert.equal(await reviewWithdrawal(db, adminId, rejectId, "rejected", "Try again"), true);
  assert.equal((await withdrawalBalance(db, userId)).availableCents, 7463, "Rejection releases funds without a deduction");
  const summary = await paymentSummary(db, userId);
  assert.equal(summary.approvedAmount, 100, "Gross deposit total must stay unchanged");
  assert.equal(summary.balanceAmount, 74.63);
  assert.equal(summary.sentWithdrawalAmount, 25.37);
  assert.equal((await withdrawalHistory(db, otherId)).length, 0);
  assert.ok(summary.withdrawals.every(row => !("accountNumber" in row) && !("routingNumber" in row) && !("recipientAddress" in row)), "Account polling must not expose full bank details");
  const finalId = await requestWithdrawal(db, userId, { ...input, id: crypto.randomUUID(), amount: 7463 });
  assert.equal(await reviewWithdrawal(db, adminId, finalId, "sent", ""), true);
  assert.equal((await withdrawalBalance(db, userId)).balanceCents, 0);
  await assert.rejects(requestWithdrawal(db, userId, { ...input, id: crypto.randomUUID(), amount: 1 }), /exceeds/);
  await migrate(db, { migrationsFolder: "./migrations" });
  assert.equal((await withdrawalBalance(db, userId)).balanceCents, 0, "Deductions persist after migrations run again");
  console.log("Withdrawal checks passed: exact cents, field validation, reservations, overdraft prevention, idempotency, admin authorization, rollback, rejection, balance updates, account isolation, and persistence.");
} finally { client.close(); }
