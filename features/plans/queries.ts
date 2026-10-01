import "server-only";

import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";

const byOrder = [asc(schema.investmentPlans.sortOrder), asc(schema.investmentPlans.createdAt)];

/** Plans shown on the public website. */
export async function listVisiblePlans() {
  const db = await getDb();
  return db.select().from(schema.investmentPlans).where(eq(schema.investmentPlans.visible, true)).orderBy(...byOrder);
}

/** All plans, including hidden ones, for the admin console. */
export async function listAllPlans() {
  await requireAdmin();
  const db = await getDb();
  return db.select().from(schema.investmentPlans).orderBy(...byOrder);
}

export async function getPlan(id: string) {
  await requireAdmin();
  const db = await getDb();
  return (await db.query.investmentPlans.findFirst({ where: eq(schema.investmentPlans.id, id) })) ?? null;
}
