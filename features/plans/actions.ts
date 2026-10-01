"use server";

import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";

export type PlanFormState = { errors?: Record<string, string[]>; message?: string; values?: Record<string, string> } | undefined;
export type PlanActionState = { ok?: boolean; message?: string } | undefined;

const dollars = (label: string) => z.coerce.number({ error: `Enter the ${label} in dollars.` }).int({ error: `Use whole dollars for the ${label}.` }).min(1, { error: `The ${label} must be at least $1.` }).max(100_000_000);
const text = (label: string, maxLength = 80) => z.string().trim().min(1, { error: `Enter the ${label}.` }).max(maxLength, { error: `Keep the ${label} under ${maxLength} characters.` });

const PlanSchema = z.object({
  name: text("plan name", 40),
  tagline: text("tagline", 120),
  minInvestment: dollars("minimum"),
  maxInvestment: z.union([z.literal(""), dollars("maximum")]).transform(value => (value === "" ? null : value)),
  duration: text("duration", 40),
  withdrawals: text("withdrawal frequency", 40),
  riskLevel: z.enum(["low", "moderate", "high"], { error: "Choose a risk level." }),
  expectedReturn: text("expected return", 40),
  fee: text("fee", 40),
  features: z.string().transform(value => value.split("\n").map(line => line.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(100, { error: "Keep each feature under 100 characters." })).min(1, { error: "Add at least one feature." }).max(8, { error: "Use at most 8 features." })),
  featured: z.literal("on").optional().transform(Boolean),
  visible: z.literal("on").optional().transform(Boolean),
});

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/plans");
}

export async function savePlan(_state: PlanFormState, formData: FormData): Promise<PlanFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = PlanSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    // Send the submitted values back so the form keeps what the admin typed.
    const values = Object.fromEntries([...formData.entries()].filter(([, entry]) => typeof entry === "string")) as Record<string, string>;
    return { errors: z.flattenError(parsed.error).fieldErrors, message: "Please fix the highlighted fields.", values };
  }

  const db = await getDb();
  const now = new Date();
  if (parsed.data.featured) {
    // Only one plan is highlighted at a time.
    await db.update(schema.investmentPlans).set({ featured: false });
  }
  if (id) {
    if (!z.uuid().safeParse(id).success) return { message: "Unknown plan." };
    await db.update(schema.investmentPlans).set({ ...parsed.data, updatedAt: now }).where(eq(schema.investmentPlans.id, id));
  } else {
    const [{ last }] = await db.select({ last: max(schema.investmentPlans.sortOrder) }).from(schema.investmentPlans);
    await db.insert(schema.investmentPlans).values({ id: crypto.randomUUID(), ...parsed.data, sortOrder: (last ?? 0) + 1, createdAt: now, updatedAt: now });
  }
  refresh();
  redirect("/admin/plans?saved=1");
}

const IdSchema = z.object({ id: z.uuid() });

export async function togglePlanVisibility(_state: PlanActionState, formData: FormData): Promise<PlanActionState> {
  await requireAdmin();
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { message: "Unknown plan." };
  const db = await getDb();
  const plan = await db.query.investmentPlans.findFirst({ where: eq(schema.investmentPlans.id, parsed.data.id), columns: { visible: true } });
  if (!plan) return { message: "Unknown plan." };
  await db.update(schema.investmentPlans).set({ visible: !plan.visible, updatedAt: new Date() }).where(eq(schema.investmentPlans.id, parsed.data.id));
  refresh();
  return { ok: true };
}

export async function movePlan(_state: PlanActionState, formData: FormData): Promise<PlanActionState> {
  await requireAdmin();
  const parsed = IdSchema.extend({ direction: z.enum(["up", "down"]) }).safeParse({ id: formData.get("id"), direction: formData.get("direction") });
  if (!parsed.success) return { message: "Invalid request." };
  const db = await getDb();
  const plans = await db.select({ id: schema.investmentPlans.id }).from(schema.investmentPlans).orderBy(asc(schema.investmentPlans.sortOrder), asc(schema.investmentPlans.createdAt));
  const index = plans.findIndex(plan => plan.id === parsed.data.id);
  const target = index + (parsed.data.direction === "up" ? -1 : 1);
  if (index < 0 || target < 0 || target >= plans.length) return { ok: true };
  [plans[index], plans[target]] = [plans[target], plans[index]];
  // Rewrite a clean 1..n order so gaps and ties never build up.
  await Promise.all(plans.map((plan, position) => db.update(schema.investmentPlans).set({ sortOrder: position + 1 }).where(eq(schema.investmentPlans.id, plan.id))));
  refresh();
  return { ok: true };
}

export async function deletePlan(_state: PlanActionState, formData: FormData): Promise<PlanActionState> {
  await requireAdmin();
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { message: "Unknown plan." };
  const db = await getDb();
  await db.delete(schema.investmentPlans).where(eq(schema.investmentPlans.id, parsed.data.id));
  refresh();
  return { ok: true, message: "Plan deleted." };
}
