"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { requestWithdrawal, reviewWithdrawal, WithdrawalError } from "./service";
import { withdrawalSchema } from "./validation";

export type WithdrawalFormState = { message?: string; errors?: Record<string, string[]>; values?: Record<string, string> };

function refresh() {
  for (const path of ["/withdrawals", "/admin/withdrawals", "/admin/activity", "/dashboard", "/plans", "/wallet"]) revalidatePath(path);
}

export async function submitWithdrawal(_state: WithdrawalFormState, formData: FormData): Promise<WithdrawalFormState> {
  const user = await requireUser("/withdrawals");
  const values = Object.fromEntries(["id", "amount", "beneficiaryName", "accountNumber", "routingNumber", "recipientAddress", "bankAddress", "bankName"].map(key => [key, String(formData.get(key) ?? "")]));
  const parsed = withdrawalSchema.safeParse(values);
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: z.flattenError(parsed.error).fieldErrors, values };
  try {
    await requestWithdrawal(await getDb(), user.id, parsed.data);
  } catch (error) {
    return { message: error instanceof WithdrawalError ? error.message : "Could not submit your withdrawal. Please try again.", values };
  }
  refresh();
  redirect("/withdrawals?submitted=1");
}

export async function markWithdrawal(_state: WithdrawalFormState, formData: FormData): Promise<WithdrawalFormState> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.uuid(), decision: z.enum(["sent", "rejected"]), note: z.string().trim().max(500) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Invalid review. Keep the note under 500 characters." };
  try {
    const changed = await reviewWithdrawal(await getDb(), admin.id, parsed.data.id, parsed.data.decision, parsed.data.note);
    if (!changed) return { message: "This withdrawal has already been reviewed. Refresh to see its status." };
  } catch (error) {
    return { message: error instanceof WithdrawalError ? error.message : "Could not save this review. Please try again." };
  }
  refresh();
  return { message: parsed.data.decision === "sent" ? "Marked as sent. The balance has been deducted." : "Request rejected. The reserved amount is available again." };
}
