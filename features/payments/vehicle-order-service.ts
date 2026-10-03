import { and, desc, eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/types";
import * as schema from "@/lib/db/schema";
import { bankSummary } from "./methods";

const orders = schema.vehicleOrders;

// Never include receipt storage keys in lists or in client component props.
export const orderColumns = {
  id: orders.id, userId: orders.userId, vehicleId: orders.vehicleId, vehicleName: orders.vehicleName, price: orders.price,
  methodName: orders.methodName, network: orders.network, address: orders.address, status: orders.status,
  submittedAt: orders.submittedAt, reviewedAt: orders.reviewedAt, reviewNote: orders.reviewNote,
};

export async function listUserOrders(db: Database, userId: string) {
  return db.select(orderColumns).from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.submittedAt));
}

/** The price is always read from the listing here, never from the browser. */
export async function submitVehicleOrder(db: Database, userId: string, input: {
  id: string; vehicleId: string; methodId: string; address: string; screenshotKey: string; screenshotType: string;
}) {
  return db.transaction(async tx => {
    const existing = await tx.select({ id: orders.id, userId: orders.userId }).from(orders).where(eq(orders.id, input.id));
    if (existing.length) {
      if (existing[0].userId !== userId) throw new Error("Invalid submission. Refresh and try again.");
      return existing[0].id;
    }
    const vehicle = await tx.query.vehicles.findFirst({ where: and(eq(schema.vehicles.id, input.vehicleId), eq(schema.vehicles.visible, true)) });
    if (!vehicle) throw new Error("This car is no longer available.");
    const method = await tx.query.paymentMethods.findFirst({ where: eq(schema.paymentMethods.id, input.methodId) });
    if (!method?.address.trim()) throw new Error("This payment method is no longer available.");
    if (method.address !== input.address) throw new Error("The payment details have changed. Refresh the page before submitting.");
    const pending = await tx.select({ id: orders.id }).from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.vehicleId, vehicle.id), eq(orders.status, "pending")));
    if (pending.length) return pending[0].id;
    const name = `${vehicle.year} ${vehicle.model} ${vehicle.trim}`;
    await tx.insert(orders).values({
      id: input.id, userId, vehicleId: vehicle.id, vehicleName: name, price: vehicle.price,
      methodName: method.name, network: method.network, address: method.kind === "bank" ? bankSummary(method) : method.address,
      screenshotKey: input.screenshotKey, screenshotType: input.screenshotType, submittedAt: new Date(),
    });
    await tx.insert(schema.auditLog).values({ id: crypto.randomUUID(), actorId: userId, targetUserId: userId,
      action: "vehicle_order.submitted", detail: `${name}: $${vehicle.price}`, createdAt: new Date() });
    return input.id;
  });
}

/** A conditional transition makes repeat clicks and competing reviews harmless. */
export async function reviewVehicleOrder(db: Database, adminId: string, id: string, decision: "approved" | "rejected", note: string) {
  return db.transaction(async tx => {
    const [order] = await tx.update(orders).set({ status: decision, reviewedAt: new Date(), reviewedBy: adminId, reviewNote: note || null })
      .where(and(eq(orders.id, id), eq(orders.status, "pending"), sql`exists (select 1 from users where id = ${adminId} and role = 'admin' and status = 'active')`))
      .returning({ userId: orders.userId, vehicleName: orders.vehicleName, price: orders.price });
    if (!order) return false;
    await tx.insert(schema.auditLog).values({ id: crypto.randomUUID(), actorId: adminId, targetUserId: order.userId,
      action: `vehicle_order.${decision}`, detail: `${order.vehicleName}: $${order.price}`, createdAt: new Date() });
    return true;
  });
}
