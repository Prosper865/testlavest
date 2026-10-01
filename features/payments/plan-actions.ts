"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { reviewPlanPayment, submitPlanPayment } from "./plan-payment-service";
import { deletePrivateFile, uploadPrivateFile } from "@/lib/cloudinary";
import { MAX_UPLOAD_MB } from "@/lib/uploads";
import { MAX_RECEIPT_BYTES, receiptType } from "./receipt";

export type SubmissionState = { message?: string };
const inputSchema = z.object({
  id: z.uuid(), planId: z.uuid(), methodId: z.uuid(),
  amount: z.coerce.number().int().min(1).max(100_000_000), address: z.string().min(1).max(256),
});

export async function submitPlanReceipt(_state: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const user = await requireUser();
  if (user.role !== "user") return { message: "Use a user account to submit a plan payment." };
  const parsed = inputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Choose a payment method and a valid whole-dollar amount." };
  const file = formData.get("screenshot");
  if (!(file instanceof File) || !file.size) return { message: "Upload a payment screenshot." };
  if (file.size > MAX_RECEIPT_BYTES) return { message: `The screenshot must be ${MAX_UPLOAD_MB} MB or smaller.` };
  const screenshot = Buffer.from(await file.arrayBuffer());
  const screenshotType = receiptType(screenshot);
  if (!screenshotType) return { message: "Choose a PNG, JPG, or WebP screenshot." };
  // The file is uploaded only now, after the whole form has been validated.
  let screenshotKey: string;
  try {
    screenshotKey = await uploadPrivateFile(screenshot, `receipts/${user.id}`, screenshotType.split("/")[1]);
  } catch {
    return { message: "Could not upload your screenshot. Please try again." };
  }
  const db = await getDb();
  try {
    const savedId = await submitPlanPayment(db, user.id, { ...parsed.data, screenshotKey, screenshotType });
    // A repeat submission returns the earlier record, so this upload may be unused.
    const [saved] = await db.select({ key: schema.planPayments.screenshotKey }).from(schema.planPayments).where(eq(schema.planPayments.id, savedId));
    if (saved?.key !== screenshotKey) await deletePrivateFile(screenshotKey);
  } catch (error) {
    await deletePrivateFile(screenshotKey);
    const message = error instanceof Error ? error.message : "";
    const expected = ["This plan is no longer available.", "Choose an amount within this plan’s investment limits.", "This payment method is no longer available.", "The receiving address has changed. Refresh the page before submitting.", "Invalid submission. Refresh and try again."];
    return { message: expected.includes(message) ? message : "Could not submit your screenshot. Please try again." };
  }
  revalidatePath("/plans");
  revalidatePath("/deposits");
  revalidatePath("/admin/plan-payments");
  redirect("/plans?submitted=1");
}

export async function reviewPlanReceipt(_state: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.uuid(), decision: z.enum(["approved", "rejected"]), note: z.string().trim().max(500) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Choose a decision and keep the review note under 500 characters." };
  const { id, decision, note } = parsed.data;
  try {
    const changed = await reviewPlanPayment(await getDb(), admin.id, id, decision, note);
    if (!changed) return { message: "This submission has already been reviewed. Refresh to see its status." };
  } catch {
    return { message: "Could not save this review. Please try again." };
  }
  revalidatePath("/admin/plan-payments");
  revalidatePath("/admin/activity");
  revalidatePath("/plans");
  revalidatePath("/dashboard");
  revalidatePath("/deposits");
  return { message: decision === "approved" ? "Approved. The plan amount is now in the user’s investment balance." : "Payment rejected. No balance was added." };
}
