  import "server-only";

// Private Cloudinary storage for identity documents and payment receipts. Files are uploaded only
// from server actions, after the whole form has been validated, as "authenticated" raw assets: the
// exact bytes are kept and nothing is publicly reachable. Route handlers check access, then fetch
// the file through a signed URL and stream it to the browser.

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

let configured = false;
function client() {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;
    if (!cloud_name || !api_key || !api_secret) throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
  }
  return cloudinary;
}

const options = { resource_type: "raw", type: "authenticated" } as const;
const root = () => process.env.CLOUDINARY_FOLDER || "aurevia";

/** Uploads bytes and returns the storage key (the Cloudinary public ID). */
export async function uploadPrivateFile(bytes: Uint8Array, folder: string, ext: string) {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    client().uploader.upload_stream(
      { ...options, folder: `${root()}/${folder}`, public_id: `${crypto.randomUUID()}.${ext}`, overwrite: false },
      (error, response) => (error || !response ? reject(error ?? new Error("Upload failed")) : resolve(response)),
    ).end(Buffer.from(bytes));
  });
  return result.public_id;
}

/** Downloads a stored file, or returns null when it is missing. */
export async function readPrivateFile(key: string) {
  const url = client().url(key, { ...options, sign_url: true });
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

/** Best-effort delete, used to clean up after a submission that failed after uploading. */
export async function deletePrivateFile(key: string) {
  try {
    await client().uploader.destroy(key, { ...options, invalidate: true });
  } catch (error) {
    console.error("Could not delete Cloudinary file", key, error);
  }
}
