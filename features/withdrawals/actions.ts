"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { messageWithdrawal, requestWithdrawal, reviewWithdrawal, WithdrawalError } from "./service";
import { NETWORK_ISSUE_MESSAGE } from "./messages";
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
  const parsed = z.object({ id: z.uuid(), decision: z.enum(["sent", "rejected", "network_issue", "message"]), note: z.string().trim().max(500) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Invalid review. Keep the note under 500 characters." };
  try {
    const { id, decision, note } = parsed.data;
    const db = await getDb();
    const changed = decision === "network_issue" || decision === "message"
      ? await messageWithdrawal(db, admin.id, id, decision === "network_issue" ? NETWORK_ISSUE_MESSAGE : note)
      : await reviewWithdrawal(db, admin.id, id, decision, note);
    if (!changed) return { message: "This withdrawal has already been reviewed. Refresh to see its status." };
  } catch (error) {
    return { message: error instanceof WithdrawalError ? error.message : "Could not save this review. Please try again." };
  }
  refresh();
  if (parsed.data.decision === "network_issue" || parsed.data.decision === "message") return { message: "Update sent to the user’s withdrawal history. The request remains pending and its funds stay reserved." };
  return { message: parsed.data.decision === "sent" ? "Marked as sent." : "Request rejected. The reserved amount is available again." };
}
