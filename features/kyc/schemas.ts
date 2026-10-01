import * as z from "zod";
import { countries, sourcesOfFunds } from "./constants";

function isAdult(value: string) {
  const birth = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const eighteen = new Date(birth);
  eighteen.setUTCFullYear(birth.getUTCFullYear() + 18);
  return eighteen <= new Date() && birth.getUTCFullYear() > 1900;
}

const text = (label: string, max = 120) => z.string().trim().min(1, { error: `Enter your ${label}.` }).max(max, { error: `${label} is too long.` });

export const KycSchema = z.object({
  legalName: text("legal name", 100).min(2, { error: "Enter your full legal name." }),
  dateOfBirth: z.string().refine(isAdult, { error: "You must be at least 18 years old." }),
  nationality: z.enum(countries, { error: "Choose your nationality." }),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, { error: "Enter a valid phone number, e.g. +1 555 123 4567." }),
  addressLine: text("street address", 160),
  city: text("city", 80),
  postalCode: z.string().trim().min(2, { error: "Enter your postal code." }).max(16),
  country: z.enum(countries, { error: "Choose your country of residence." }),
  occupation: text("occupation", 80),
  sourceOfFunds: z.enum(sourcesOfFunds, { error: "Choose a source of funds." }),
  documentType: z.enum(["passport", "drivers_license", "national_id"], { error: "Choose a document type." }),
  documentNumber: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, { error: "Enter the document number (5–20 letters or digits)." }),
  consent: z.literal("on", { error: "Please confirm the information is accurate." }),
});

export type KycField = keyof z.infer<typeof KycSchema> | "documentFile" | "selfieFile";

export type KycFormState = {
  errors?: Partial<Record<KycField, string[]>>;
  message?: string;
} | undefined;
