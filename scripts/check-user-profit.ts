import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import { profitInput, updateUserProfit } from "../features/admin/profit-service";
import { paymentSummary } from "../features/payments/plan-payment-service";
import { requestWithdrawal, reviewWithdrawal } from "../features/withdrawals/service";

const client = new PGlite();
const db = drizzle(client, { schema });
try {
  await migrate(db, { migrationsFolder: "./migrations" });
  const userId = crypto.randomUUID(), otherId = crypto.randomUUID(), adminId = crypto.randomUUID();
  for (const [id, role] of [[userId, "user"], [otherId, "user"], [adminId, "admin"]] as const) {
    await db.insert(schema.users).values({ id, role, name: role, email: `${id}@example.test`, passwordHash: "test-only", createdAt: new Date() });
  }
  const input = profitInput.parse({ userId, expectedCents: 0, profit: "25.37" });
  assert.equal(input.profit, 2537);
  for (const profit of ["-1", "1.001", "NaN", "1e3", "100000001", ""]) assert.equal(profitInput.safeParse({ userId, expectedCents: 0, profit }).success, false);
  assert.equal(profitInput.parse({ userId, expectedCents: 0, profit: "0" }).profit, 0);
  await assert.rejects(updateUserProfit(db, userId, input), /active admin/);
  await updateUserProfit(db, adminId, input);
  assert.equal((await paymentSummary(db, userId)).profitAmount, 25.37);
  assert.equal((await paymentSummary(db, userId)).balanceAmount, 25.37);
  assert.equal((await paymentSummary(db, otherId)).profitAmount, 0, "Only the selected user changes");
  await updateUserProfit(db, adminId, input);
  assert.equal((await db.select().from(schema.auditLog).where(eq(schema.auditLog.action, "user.profit_updated"))).length, 1);
  await updateUserProfit(db, adminId, { userId, expectedCents: 2537, profit: 5000 });
  assert.equal((await paymentSummary(db, userId)).balanceAmount, 50, "Profit replaces the previous total");
  await assert.rejects(updateUserProfit(db, adminId, { userId, expectedCents: 2537, profit: 6000 }), /another admin/);
  await assert.rejects(updateUserProfit(db, adminId, { ...input, userId: adminId }), /individual user/);
  const withdrawalId = await requestWithdrawal(db, userId, { id: crypto.randomUUID(), amount: 4000, beneficiaryName: "Demo", accountNumber: "00123456", routingNumber: "000000000", bankName: "Demo Bank", recipientAddress: "Example address", bankAddress: "Example bank address" });
  await assert.rejects(updateUserProfit(db, adminId, { userId, expectedCents: 5000, profit: 3000 }), /withdrawals/);
  await reviewWithdrawal(db, adminId, withdrawalId, "sent", "");
  await assert.rejects(updateUserProfit(db, adminId, { userId, expectedCents: 5000, profit: 3000 }), /withdrawals/);
  await client.exec("CREATE OR REPLACE FUNCTION fail_profit_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test rollback'; END $$; CREATE TRIGGER fail_profit_audit BEFORE INSERT ON audit_log FOR EACH ROW WHEN (NEW.action = 'user.profit_updated') EXECUTE FUNCTION fail_profit_audit();");
  await assert.rejects(updateUserProfit(db, adminId, { userId, expectedCents: 5000, profit: 4500 }));
  assert.equal((await paymentSummary(db, userId)).profitAmount, 50);
  await client.exec("DROP TRIGGER fail_profit_audit ON audit_log");
  await updateUserProfit(db, adminId, { userId, expectedCents: 5000, profit: 4500 });
  assert.equal((await paymentSummary(db, userId)).balanceAmount, 5);
  assert.equal((await paymentSummary(db, otherId)).balanceAmount, 0);
  await migrate(db, { migrationsFolder: "./migrations" });
  assert.equal((await paymentSummary(db, userId)).profitAmount, 45);
  console.log("User profit checks passed: individual accounts, exact cents, replacement, duplicate saves, admin authorization, stale edits, withdrawal coverage, audit rollback, and persistence.");
} finally { client.close(); }
