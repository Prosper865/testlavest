import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { readUpload } from "@/features/kyc/storage";

// Serves a KYC upload to admins, or to the user who submitted it. Never cached.
export async function GET(_request: Request, { params }: RouteContext<"/api/kyc/[id]/[file]">) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id, file } = await params;
  if (file !== "document" && file !== "selfie") return new Response("Not found", { status: 404 });

  const db = await getDb();
  const submission = await db.query.kycSubmissions.findFirst({
    where: eq(schema.kycSubmissions.id, id),
    columns: { userId: true, documentFile: true, selfieFile: true },
  });
  if (!submission) return new Response("Not found", { status: 404 });
  if (user.role !== "admin" && submission.userId !== user.id) return new Response("Forbidden", { status: 403 });

  const upload = await readUpload(file === "document" ? submission.documentFile : submission.selfieFile);
  if (!upload) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(upload.bytes), {
    headers: {
      "Content-Type": upload.type,
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
