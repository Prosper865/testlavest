import "server-only";

import { asc, ne } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { PayMethod } from "./methods";

const table = schema.paymentMethods;

/** Wallets and bank accounts users can pay into. Methods the admin left blank are hidden. */
export async function listPayableMethods(): Promise<PayMethod[]> {
  const db = await getDb();
  return db.select({
    id: table.id, kind: table.kind, name: table.name, network: table.network, address: table.address,
    accountName: table.accountName, routingNumber: table.routingNumber, instructions: table.instructions,
  }).from(table).where(ne(table.address, "")).orderBy(asc(table.kind), asc(table.name), asc(table.network));
}
