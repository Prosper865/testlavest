import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/types";
import { z } from "zod";
import * as schema from "@/lib/db/schema";
import { lockUser, withdrawalBalance } from "@/features/withdrawals/service";

export const profitInput = z.object({
  userId: z.uuid(),
  expectedCents: z.coerce.number().int().min(0).max(10_000_000_000),
  profit: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a profit amount with up to two decimal places.")
    .transform(value => { const [whole, fraction = ""] = value.split("."); return Number(whole) * 100 + Number(fraction.padEnd(2, "0")); })
    .pipe(z.number().int().min(0).max(10_000_000_000, "Profit cannot exceed $100,000,000.")),
});

export class ProfitError extends Error {}

export async function updateUserProfit(db: Database, adminId: string, input: z.infer<typeof profitInput>) {
  if (!Number.isSafeInteger(input.profit) || input.profit < 0 || input.profit > 10_000_000_000) throw new ProfitError("Invalid profit amount.");
  return db.transaction(async tx => {
    const admin = await tx.query.users.findFirst({ where: and(eq(schema.users.id, adminId), eq(schema.users.role, "admin"), eq(schema.users.status, "active")) });
    if (!admin) throw new ProfitError("Only an active admin can update profit.");
    await lockUser(tx, input.userId);
    const user = await tx.query.users.findFirst({ where: eq(schema.users.id, input.userId) });
    if (!user || user.role !== "user") throw new ProfitError("Select an individual user account.");
    if (user.profitCents === input.profit) return;
    if (user.profitCents !== input.expectedCents) throw new ProfitError("This user’s profit was changed by another admin. Refresh before saving again.");
    const balance = await withdrawalBalance(tx, user.id);
    if (balance.approvedCents + input.profit - balance.spentCents < balance.sentCents + balance.pendingCents) {
      throw new ProfitError("This profit would leave too little balance to cover purchases and sent or pending withdrawals.");
    }
    await tx.update(schema.users).set({ profitCents: input.profit }).where(eq(schema.users.id, user.id));
    await tx.insert(schema.auditLog).values({
      id: crypto.randomUUID(), actorId: adminId, targetUserId: user.id, action: "user.profit_updated",
      detail: `$${(user.profitCents / 100).toFixed(2)} → $${(input.profit / 100).toFixed(2)}`, createdAt: new Date(),
    });
  });
}
