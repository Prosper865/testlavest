"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { deletePrivateFile, uploadPrivateFile } from "@/lib/cloudinary";
import { getDb, schema } from "@/lib/db";
import { MAX_UPLOAD_MB } from "@/lib/uploads";
import { MAX_RECEIPT_BYTES, receiptType } from "./receipt";
import { reviewVehicleOrder, submitVehicleOrder } from "./vehicle-order-service";

export type OrderState = { message?: string };
const inputSchema = z.object({ id: z.uuid(), vehicleId: z.string().min(1).max(64), methodId: z.uuid(), address: z.string().min(1).max(256) });

export async function submitOrderReceipt(_state: OrderState, formData: FormData): Promise<OrderState> {
  const user = await requireUser();
  if (user.role !== "user") return { message: "Use a user account to order a car." };
  const parsed = inputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Choose a payment method before submitting." };
  const file = formData.get("screenshot");
  if (!(file instanceof File) || !file.size) return { message: "Upload your proof of payment." };
  if (file.size > MAX_RECEIPT_BYTES) return { message: `The file must be ${MAX_UPLOAD_MB} MB or smaller.` };
  const bytes = Buffer.from(await file.arrayBuffer());
  const screenshotType = receiptType(bytes);
  if (!screenshotType) return { message: "Choose a PNG, JPG, or WebP image." };
  // The file is uploaded only now, after the whole form has been validated.
  let screenshotKey: string;
  try {
    screenshotKey = await uploadPrivateFile(bytes, `orders/${user.id}`, screenshotType.split("/")[1]);
  } catch {
    return { message: "Could not upload your file. Please try again." };
  }
  const db = await getDb();
  try {
    const savedId = await submitVehicleOrder(db, user.id, { ...parsed.data, screenshotKey, screenshotType });
    // A repeat submission returns the earlier record, so this upload may be unused.
    const [saved] = await db.select({ key: schema.vehicleOrders.screenshotKey }).from(schema.vehicleOrders).where(eq(schema.vehicleOrders.id, savedId));
    if (saved?.key !== screenshotKey) await deletePrivateFile(screenshotKey);
  } catch (error) {
    await deletePrivateFile(screenshotKey);
    const message = error instanceof Error ? error.message : "";
    const expected = ["This car is no longer available.", "This payment method is no longer available.", "The payment details have changed. Refresh the page before submitting.", "Invalid submission. Refresh and try again."];
    return { message: expected.includes(message) ? message : "Could not submit your order. Please try again." };
  }
  revalidatePath("/marketplace");
  revalidatePath("/admin/vehicle-orders");
  redirect("/marketplace?ordered=1");
}

export async function reviewOrderReceipt(_state: OrderState, formData: FormData): Promise<OrderState> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: z.uuid(), decision: z.enum(["approved", "rejected"]), note: z.string().trim().max(500) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Choose a decision and keep the review note under 500 characters." };
  const { id, decision, note } = parsed.data;
  try {
    const changed = await reviewVehicleOrder(await getDb(), admin.id, id, decision, note);
    if (!changed) return { message: "This order has already been reviewed. Refresh to see its status." };
  } catch {
    return { message: "Could not save this review. Please try again." };
  }
  revalidatePath("/admin/vehicle-orders");
  revalidatePath("/admin/activity");
  revalidatePath("/marketplace");
  return { message: decision === "approved" ? "Order approved. The user can see it as confirmed." : "Order rejected. The user can place a new order." };
}
