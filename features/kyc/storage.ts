import "server-only";

// Private storage for identity documents, kept in Cloudinary (see lib/cloudinary.ts) and only
// served through an authorised route handler.

import { deletePrivateFile, readPrivateFile, uploadPrivateFile } from "@/lib/cloudinary";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/uploads";

// Identify files by their first bytes rather than trusting the browser-supplied type or name.
const signatures: { type: string; ext: string; test: (bytes: Uint8Array) => boolean }[] = [
  { type: "image/jpeg", ext: "jpg", test: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", ext: "png", test: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: "image/webp", ext: "webp", test: b => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP" },
  { type: "application/pdf", ext: "pdf", test: b => String.fromCharCode(...b.slice(0, 5)) === "%PDF-" },
];

export type CheckedUpload = { ok: true; bytes: Uint8Array; ext: string } | { ok: false; error: string };

/** Validates a submitted file without storing it. */
export async function checkUpload(file: FormDataEntryValue | null, label: string): Promise<CheckedUpload> {
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: `Upload your ${label}.` };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: `The ${label} must be ${MAX_UPLOAD_MB} MB or smaller.` };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = signatures.find(signature => signature.test(bytes));
  if (!kind) return { ok: false, error: `The ${label} must be a JPG, PNG, WebP, or PDF file.` };
  return { ok: true, bytes, ext: kind.ext };
}

/** Stores a checked file and returns its storage key. */
export function saveUpload(userId: string, upload: { bytes: Uint8Array; ext: string }) {
  return uploadPrivateFile(upload.bytes, `kyc/${userId}`, upload.ext);
}

export const deleteUpload = deletePrivateFile;

export async function readUpload(key: string) {
  const bytes = await readPrivateFile(key);
  if (!bytes) return null;
  const type = signatures.find(signature => signature.test(bytes))?.type ?? "application/octet-stream";
  return { bytes, type };
}
