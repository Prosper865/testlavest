"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";

export type PaymentState = { ok?: boolean; message?: string; values?: Record<string, string> };

const paymentInput = z.object({
  id: z.union([z.literal(""), z.uuid()]),
  name: z.string().trim().min(1, "Enter a payment method name.").max(80),
  network: z.string().trim().min(1, "Enter the network or payment provider.").max(80),
  address: z.string().trim().max(256, "Keep the payment address under 256 characters.")
    .refine(value => !/[\r\n\t]/.test(value), "Enter the address on a single line."),
});

export async function savePaymentMethod(_state: PaymentState, formData: FormData): Promise<PaymentState> {
  const admin = await requireAdmin();
  const values = Object.fromEntries(["id", "name", "network", "address"].map(key => [key, String(formData.get(key) ?? "")]));
  const parsed = paymentInput.safeParse(values);
  if (!parsed.success) return { message: parsed.error.issues[0].message, values };
  const { id, ...data } = parsed.data;
  const db = await getDb();
  try {
    const saved = await db.transaction(async tx => {
      if (id) {
        const rows = await tx.update(schema.paymentMethods).set({ ...data, updatedAt: new Date() })
          .where(eq(schema.paymentMethods.id, id)).returning({ id: schema.paymentMethods.id });
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
  revalidatePath("/admin/payments");
  revalidatePath("/deposits");
  revalidatePath("/admin/activity");
  return { ok: true, message: id ? "Payment method saved." : "Payment method added." };
}
