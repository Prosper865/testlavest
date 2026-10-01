// Shared upload limits. Safe to import from client components (no secrets here).

/** Maximum size of any single uploaded file, in megabytes. */
export const MAX_UPLOAD_MB = 5;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** Returns an error message when a selected file is over the limit, otherwise null. */
export function uploadSizeError(file: File | null | undefined, label = "File") {
  return file && file.size > MAX_UPLOAD_BYTES ? `${label} must be ${MAX_UPLOAD_MB} MB or smaller.` : null;
}
