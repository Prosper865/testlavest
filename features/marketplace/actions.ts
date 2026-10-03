"use server";

import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireAdmin } from "@/lib/auth/dal";
import { uploadPublicImage } from "@/lib/cloudinary";
import { getDb, schema } from "@/lib/db";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/uploads";

export type VehicleFormState = { errors?: Record<string, string[]>; message?: string; values?: Record<string, string> } | undefined;
export type VehicleActionState = { ok?: boolean; message?: string } | undefined;

const text = (label: string, maxLength = 60) => z.string().trim().min(1, { error: `Enter the ${label}.` }).max(maxLength, { error: `Keep the ${label} under ${maxLength} characters.` });
const whole = (label: string, min: number, maxValue: number) => z.coerce.number({ error: `Enter the ${label}.` }).int({ error: `Use a whole number for the ${label}.` }).min(min, { error: `The ${label} must be at least ${min.toLocaleString("en-US")}.` }).max(maxValue, { error: `The ${label} must be at most ${maxValue.toLocaleString("en-US")}.` });

const VehicleSchema = z.object({
  model: text("model", 40),
  trim: text("trim", 60),
  year: whole("year", 2008, new Date().getFullYear() + 2),
  condition: z.enum(["New", "Pre-owned"], { error: "Choose the condition." }),
  price: whole("price", 1, 10_000_000),
  rangeMiles: whole("range", 1, 2000),
  zeroToSixty: z.coerce.number({ error: "Enter the 0–60 time in seconds." }).min(1, { error: "Enter a 0–60 time of at least 1 second." }).max(30, { error: "Enter a 0–60 time under 30 seconds." }),
  mileage: z.union([z.literal(""), whole("mileage", 0, 1_000_000)]).transform(value => (value === "" ? null : value)),
  color: text("colour", 40),
  swatch: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Pick a paint colour." }),
  highlight: text("highlight", 80),
  imageUrl: z.union([z.literal(""), z.url({ protocol: /^https$/, error: "Use an https:// image link." }).max(500)]).transform(value => value || null),
  visible: z.literal("on").optional().transform(Boolean),
});

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function refresh() {
  revalidatePath("/marketplace");
  revalidatePath("/tesla");
  revalidatePath("/admin/marketplace");
}

export async function saveVehicle(_state: VehicleFormState, formData: FormData): Promise<VehicleFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const values = Object.fromEntries([...formData.entries()].filter(([, entry]) => typeof entry === "string")) as Record<string, string>;
  const parsed = VehicleSchema.safeParse(values);
  const image = formData.get("image");
  const file = image instanceof File && image.size > 0 ? image : null;
  const imageError = file && !imageTypes.includes(file.type) ? "Upload a JPG, PNG, WebP, or AVIF image."
    : file && file.size > MAX_UPLOAD_BYTES ? `The photo must be ${MAX_UPLOAD_MB} MB or smaller.` : null;

  if (!parsed.success || imageError) {
    const errors = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors as Record<string, string[]>;
    if (imageError) errors.image = [imageError];
    // Send the submitted values back so the form keeps what the admin typed.
    return { errors, message: "Please fix the highlighted fields.", values };
  }

  const data = { ...parsed.data };
  if (data.condition === "New") data.mileage = null;
  if (file) {
    try {
      data.imageUrl = await uploadPublicImage(new Uint8Array(await file.arrayBuffer()), "vehicles");
    } catch (error) {
      console.error("Vehicle photo upload failed", error);
      return { errors: { image: ["The photo couldn't be uploaded. Try again, or paste an image link instead."] }, message: "Please fix the highlighted fields.", values };
    }
  }

  const db = await getDb();
  const now = new Date();
  if (id) {
    const updated = await db.update(schema.vehicles).set({ ...data, updatedAt: now }).where(eq(schema.vehicles.id, id)).returning({ id: schema.vehicles.id });
    if (updated.length === 0) return { message: "This car no longer exists." };
  } else {
    const [{ last }] = await db.select({ last: max(schema.vehicles.sortOrder) }).from(schema.vehicles);
    await db.insert(schema.vehicles).values({ id: crypto.randomUUID(), ...data, sortOrder: (last ?? 0) + 1, createdAt: now, updatedAt: now });
  }
  refresh();
  redirect("/admin/marketplace?saved=1");
}

const IdSchema = z.object({ id: z.string().min(1).max(64) });

export async function toggleVehicleVisibility(_state: VehicleActionState, formData: FormData): Promise<VehicleActionState> {
  await requireAdmin();
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { message: "Unknown car." };
  const db = await getDb();
  const vehicle = await db.query.vehicles.findFirst({ where: eq(schema.vehicles.id, parsed.data.id), columns: { visible: true } });
  if (!vehicle) return { message: "Unknown car." };
  await db.update(schema.vehicles).set({ visible: !vehicle.visible, updatedAt: new Date() }).where(eq(schema.vehicles.id, parsed.data.id));
  refresh();
  return { ok: true };
}

export async function moveVehicle(_state: VehicleActionState, formData: FormData): Promise<VehicleActionState> {
  await requireAdmin();
  const parsed = IdSchema.extend({ direction: z.enum(["up", "down"]) }).safeParse({ id: formData.get("id"), direction: formData.get("direction") });
  if (!parsed.success) return { message: "Invalid request." };
  const db = await getDb();
  const rows = await db.select({ id: schema.vehicles.id }).from(schema.vehicles).orderBy(asc(schema.vehicles.sortOrder), asc(schema.vehicles.createdAt));
  const index = rows.findIndex(row => row.id === parsed.data.id);
  const target = index + (parsed.data.direction === "up" ? -1 : 1);
  if (index < 0 || target < 0 || target >= rows.length) return { ok: true };
  [rows[index], rows[target]] = [rows[target], rows[index]];
  // Rewrite a clean 1..n order so gaps and ties never build up.
  await Promise.all(rows.map((row, position) => db.update(schema.vehicles).set({ sortOrder: position + 1 }).where(eq(schema.vehicles.id, row.id))));
  refresh();
  return { ok: true };
}

export async function deleteVehicle(_state: VehicleActionState, formData: FormData): Promise<VehicleActionState> {
  await requireAdmin();
  const parsed = IdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { message: "Unknown car." };
  const db = await getDb();
  await db.delete(schema.vehicles).where(eq(schema.vehicles.id, parsed.data.id));
  refresh();
  return { ok: true, message: "Car deleted." };
}
