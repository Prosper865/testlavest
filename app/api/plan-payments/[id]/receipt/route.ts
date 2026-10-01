import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { readPrivateFile } from "@/lib/cloudinary";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const [payment] = await db.select({ key: schema.planPayments.screenshotKey, type: schema.planPayments.screenshotType })
    .from(schema.planPayments).where(and(eq(schema.planPayments.id, id), user.role === "admin" ? undefined : eq(schema.planPayments.userId, user.id)));
  if (!payment) return new Response("Not found", { status: 404 });
  const bytes = await readPrivateFile(payment.key);
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": payment.type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox", "Content-Disposition": "inline",
  } });
}
