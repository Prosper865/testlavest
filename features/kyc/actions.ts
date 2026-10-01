"use server";

import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";
import { recordAudit } from "@/lib/auth/audit";
import { requireUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { KycSchema, type KycFormState } from "./schemas";
import { checkUpload, deleteUpload, saveUpload } from "./storage";

export async function submitKyc(_state: KycFormState, formData: FormData): Promise<KycFormState> {
  const user = await requireUser("/verify");
  if (user.role === "admin") return { message: "Admin accounts don't need identity verification." };

  const db = await getDb();
  const open = await db.query.kycSubmissions.findFirst({
    where: and(eq(schema.kycSubmissions.userId, user.id), inArray(schema.kycSubmissions.status, ["pending", "approved"])),
    columns: { status: true },
  });
  if (open) return { message: open.status === "approved" ? "Your identity is already verified." : "Your verification is already under review." };

  const parsed = KycSchema.safeParse(Object.fromEntries([...formData.entries()].filter(([, value]) => typeof value === "string")));
  const errors: NonNullable<KycFormState>["errors"] = parsed.success ? {} : { ...z.flattenError(parsed.error).fieldErrors };

  // Check both files before uploading either, so nothing is stored for a form that will be rejected.
  const [documentFile, selfieFile] = await Promise.all([
    checkUpload(formData.get("documentFile"), "ID document"),
    checkUpload(formData.get("selfieFile"), "selfie"),
  ]);
  if (!documentFile.ok) errors.documentFile = [documentFile.error];
  if (!selfieFile.ok) errors.selfieFile = [selfieFile.error];
  if (!parsed.success || !documentFile.ok || !selfieFile.ok) {
    return { errors, message: "Please fix the highlighted fields and try again." };
  }

  // Upload only now that the whole submission is valid; remove the files if saving fails.
  const uploaded = await Promise.allSettled([saveUpload(user.id, documentFile), saveUpload(user.id, selfieFile)]);
  const keys = uploaded.flatMap(result => (result.status === "fulfilled" ? [result.value] : []));
  if (keys.length !== 2) {
    await Promise.all(keys.map(deleteUpload));
    return { message: "Could not upload your files. Please try again." };
  }
  const [documentKey, selfieKey] = keys;

  const details = parsed.data;
  try {
    await db.insert(schema.kycSubmissions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      status: "pending",
      legalName: details.legalName,
      dateOfBirth: details.dateOfBirth,
      nationality: details.nationality,
      phone: details.phone,
      addressLine: details.addressLine,
      city: details.city,
      postalCode: details.postalCode,
      country: details.country,
      occupation: details.occupation,
      sourceOfFunds: details.sourceOfFunds,
      documentType: details.documentType,
      // Only the last four characters of the document number are stored.
      documentLast4: details.documentNumber.slice(-4).toUpperCase(),
      documentFile: documentKey,
      selfieFile: selfieKey,
      submittedAt: new Date(),
    });
  } catch (error) {
    await Promise.all(keys.map(deleteUpload));
    throw error;
  }
  await recordAudit("kyc.submitted", { actorId: user.id, targetUserId: user.id, detail: details.documentType });
  redirect("/verify");
}
