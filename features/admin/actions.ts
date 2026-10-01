"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { recordAudit } from "@/lib/auth/audit";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";

export type AdminActionState = { ok?: boolean; message?: string } | undefined;

const ReviewSchema = z.object({
  submissionId: z.uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(500, { error: "Keep the note under 500 characters." }).optional(),
}).refine(value => value.decision === "approved" || (value.note && value.note.length >= 5), {
  error: "Explain why the submission is rejected so the user can fix it.",
  path: ["note"],
});

export async function reviewKyc(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = ReviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    decision: formData.get("decision"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Invalid review." };

  const { submissionId, decision, note } = parsed.data;
  const db = await getDb();
  // Only pending submissions can be decided, which also guards against double submissions.
  const updated = await db.update(schema.kycSubmissions)
    .set({ status: decision, reviewNote: note ?? null, reviewedAt: new Date(), reviewedBy: admin.id })
    .where(and(eq(schema.kycSubmissions.id, submissionId), eq(schema.kycSubmissions.status, "pending")))
    .returning({ userId: schema.kycSubmissions.userId });
  if (!updated.length) return { message: "This submission was already reviewed." };

  await recordAudit(decision === "approved" ? "kyc.approved" : "kyc.rejected", { actorId: admin.id, targetUserId: updated[0].userId, detail: note });
  revalidatePath("/admin", "layout");
  return { ok: true, message: decision === "approved" ? "Approved. The user can now trade." : "Rejected. The user will see your note." };
}

export async function setUserStatus(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ userId: z.uuid(), status: z.enum(["active", "suspended"]) }).safeParse({ userId: formData.get("userId"), status: formData.get("status") });
  if (!parsed.success) return { message: "Invalid request." };
  if (parsed.data.userId === admin.id) return { message: "You can't change your own account status." };

  const db = await getDb();
  await db.update(schema.users).set({ status: parsed.data.status }).where(eq(schema.users.id, parsed.data.userId));
  await recordAudit(parsed.data.status === "suspended" ? "user.suspended" : "user.reactivated", { actorId: admin.id, targetUserId: parsed.data.userId });
  revalidatePath("/admin", "layout");
  return { ok: true, message: parsed.data.status === "suspended" ? "Account suspended. The user is signed out on their next request." : "Account reactivated." };
}

export async function setUserRole(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ userId: z.uuid(), role: z.enum(["user", "admin"]) }).safeParse({ userId: formData.get("userId"), role: formData.get("role") });
  if (!parsed.success) return { message: "Invalid request." };
  if (parsed.data.userId === admin.id) return { message: "You can't change your own role." };

  const db = await getDb();
  await db.update(schema.users).set({ role: parsed.data.role }).where(eq(schema.users.id, parsed.data.userId));
  await recordAudit("user.role_changed", { actorId: admin.id, targetUserId: parsed.data.userId, detail: parsed.data.role });
  revalidatePath("/admin", "layout");
  return { ok: true, message: parsed.data.role === "admin" ? "Granted admin access. It applies on their next login." : "Removed admin access. It applies on their next login." };
}
