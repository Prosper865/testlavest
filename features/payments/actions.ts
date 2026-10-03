"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { BANK_NETWORK } from "./methods";

export type PaymentState = { ok?: boolean; message?: string; values?: Record<string, string> };

const singleLine = (label: string, max: number) => z.string().trim().max(max, `Keep the ${label} under ${max} characters.`)
  .refine(value => !/[\r\n\t]/.test(value), `Enter the ${label} on a single line.`);

const walletInput = z.object({
  kind: z.literal("wallet"),
  id: z.union([z.literal(""), z.uuid()]),
  name: z.string().trim().min(1, "Enter a payment method name.").max(80),
  network: z.string().trim().min(1, "Enter the network or payment provider.").max(80),
  address: singleLine("payment address", 256),
});

const bankInput = z.object({
  kind: z.literal("bank"),
  id: z.union([z.literal(""), z.uuid()]),
  name: z.string().trim().min(1, "Enter the bank name.").max(80),
  accountName: z.string().trim().min(1, "Enter the name on the account.").max(120),
  address: singleLine("account number", 64).pipe(z.string().min(1, "Enter the account number or IBAN.")),
  routingNumber: singleLine("routing number or sort code", 64),
  instructions: z.string().trim().max(300, "Keep the instructions under 300 characters."),
});

const paymentInput = z.discriminatedUnion("kind", [walletInput, bankInput]);

const fieldKeys = ["kind", "id", "name", "network", "address", "accountName", "routingNumber", "instructions"];

export async function savePaymentMethod(_state: PaymentState, formData: FormData): Promise<PaymentState> {
  const admin = await requireAdmin();
  const values = Object.fromEntries(fieldKeys.map(key => [key, String(formData.get(key) ?? "")]));
  if (values.kind !== "bank") values.kind = "wallet";
  const parsed = paymentInput.safeParse(values);
  if (!parsed.success) return { message: parsed.error.issues[0].message, values };
  const { id, ...input } = parsed.data;
  const data = input.kind === "bank"
    ? { kind: "bank" as const, name: input.name, network: BANK_NETWORK, address: input.address, accountName: input.accountName, routingNumber: input.routingNumber || null, instructions: input.instructions || null }
    : { kind: "wallet" as const, name: input.name, network: input.network, address: input.address, accountName: null, routingNumber: null, instructions: null };
  const db = await getDb();
  try {
    const saved = await db.transaction(async tx => {
      if (id) {
        // The kind never changes after creation, so a wallet can't be turned into a bank by a crafted form.
        const rows = await tx.update(schema.paymentMethods).set({ ...data, updatedAt: new Date() })
          .where(and(eq(schema.paymentMethods.id, id), eq(schema.paymentMethods.kind, data.kind))).returning({ id: schema.paymentMethods.id });
        if (!rows.length) return false;
      } else {
        await tx.insert(schema.paymentMethods).values({ id: crypto.randomUUID(), ...data, updatedAt: new Date() });
      }
      await tx.insert(schema.auditLog).values({
        id: crypto.randomUUID(), actorId: admin.id, action: "payment_method.saved",
        detail: `${data.name} (${data.network})`, createdAt: new Date(),
      });
      return true;
    });
    if (!saved) return { message: "This payment method no longer exists. Refresh the page.", values };
  } catch {
    return { message: "Could not save the payment method. Please try again.", values };
  }
  refresh();
  const noun = data.kind === "bank" ? "Bank account" : "Payment method";
  return { ok: true, message: id ? `${noun} saved.` : `${noun} added.` };
}

export async function deletePaymentMethod(_state: PaymentState, formData: FormData): Promise<PaymentState> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.uuid() }).safeParse({ id: formData.get("id") });
  if (!parsed.success) return { message: "Unknown payment method." };
  const db = await getDb();
  const removed = await db.transaction(async tx => {
    const rows = await tx.delete(schema.paymentMethods).where(eq(schema.paymentMethods.id, parsed.data.id))
      .returning({ name: schema.paymentMethods.name, network: schema.paymentMethods.network });
    if (!rows.length) return null;
    // Past submissions keep their own copy of the details, so removing a method never changes them.
    await tx.insert(schema.auditLog).values({
      id: crypto.randomUUID(), actorId: admin.id, action: "payment_method.deleted",
      detail: `${rows[0].name} (${rows[0].network})`, createdAt: new Date(),
    });
    return rows[0];
  });
  if (!removed) return { message: "This payment method no longer exists. Refresh the page." };
  refresh();
  return { ok: true, message: "Payment method removed." };
}

function refresh() {
  revalidatePath("/admin/payments");
  revalidatePath("/deposits");
  revalidatePath("/plans");
  revalidatePath("/admin/activity");
}
