"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";
import { recordAudit } from "@/lib/auth/audit";
import { clearFailures, isRateLimited, recordFailure } from "@/lib/auth/rate-limit";
import { createSession, deleteSession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { LoginSchema, SignupSchema, type AuthFormState } from "./schemas";

const HASH_ROUNDS = 12;
// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("placeholder-password-for-timing", HASH_ROUNDS);

/** Only allow same-site relative paths as post-login destinations. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : null;
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = SignupSchema.safeParse({ ...values, password: formData.get("password"), terms: formData.get("terms") });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { name, email, password } = parsed.data;
  const db = await getDb();
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email), columns: { id: true } });
  if (existing) return { errors: { email: ["An account with this email already exists. Try logging in."] }, values };

  const id = crypto.randomUUID();
  await db.insert(schema.users).values({
    id, name, email, role: "user", status: "active",
    passwordHash: await bcrypt.hash(password, HASH_ROUNDS),
    createdAt: new Date(), lastLoginAt: new Date(),
  });
  await recordAudit("user.signup", { actorId: id, targetUserId: id });
  await createSession(id, "user");
  redirect(safeNext(formData.get("next")) ?? "/verify");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { email, password } = parsed.data;
  if (isRateLimited(email)) return { message: "Too many failed attempts. Please wait 15 minutes and try again.", values };

  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    recordFailure(email);
    if (user) await recordAudit("user.login_failed", { targetUserId: user.id });
    return { message: "Incorrect email or password.", values };
  }
  if (user.status !== "active") return { message: "This account is suspended. Please contact support.", values };

  clearFailures(email);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  await recordAudit("user.login", { actorId: user.id, targetUserId: user.id });
  await createSession(user.id, user.role);
  redirect(safeNext(formData.get("next")) ?? (user.role === "admin" ? "/admin" : "/dashboard"));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
