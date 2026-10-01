"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { ProfitError, profitInput, updateUserProfit } from "./profit-service";

export type ProfitState = { ok?: boolean; message?: string };

export async function saveUserProfit(_state: ProfitState, formData: FormData): Promise<ProfitState> {
  const admin = await requireAdmin();
  const parsed = profitInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: parsed.error.issues[0].message };
  try { await updateUserProfit(await getDb(), admin.id, parsed.data); }
  catch (error) { return { message: error instanceof ProfitError ? error.message : "Could not save profit. Please try again." }; }
  revalidatePath(`/admin/users/${parsed.data.userId}`);
  for (const path of ["/admin/activity", "/dashboard", "/plans", "/deposits", "/withdrawals", "/wallet"]) revalidatePath(path);
  return { ok: true, message: `This user’s profit is now $${(parsed.data.profit / 100).toFixed(2)}.` };
}
