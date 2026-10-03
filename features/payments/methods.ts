import type { PaymentMethod } from "@/lib/db/schema";

/** What the user-facing checkout needs to know about a payment method. Safe for client components. */
export type PayMethod = Pick<PaymentMethod, "id" | "kind" | "name" | "network" | "address" | "accountName" | "routingNumber" | "instructions">;

export const BANK_NETWORK = "Bank transfer";

/** One line of bank details, saved with each submission so later edits never change past payments. */
export function bankSummary(method: Pick<PaymentMethod, "accountName" | "address" | "routingNumber">) {
  return [method.accountName, `Account ${method.address}`, method.routingNumber && `Routing ${method.routingNumber}`].filter(Boolean).join(" · ");
}
