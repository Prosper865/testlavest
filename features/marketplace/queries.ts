import "server-only";

import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";

const byOrder = [asc(schema.vehicles.sortOrder), asc(schema.vehicles.createdAt)];

/**
 * Every listing, including hidden ones. The marketplace shows only visible cars, but hidden or
 * older listings are still needed to show existing reservations and savings goals.
 */
export async function listVehicles() {
  const db = await getDb();
  return db.select().from(schema.vehicles).orderBy(...byOrder);
}

/** One listing by id, for server-side checks such as reservations. */
export async function findVehicle(id: string) {
  const db = await getDb();
  return (await db.query.vehicles.findFirst({ where: eq(schema.vehicles.id, id) })) ?? null;
}

/** All listings for the admin console. */
export async function listAllVehicles() {
  await requireAdmin();
  return listVehicles();
}

export async function getVehicleForAdmin(id: string) {
  await requireAdmin();
  return findVehicle(id);
}
