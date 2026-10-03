import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { readPrivateFile } from "@/lib/cloudinary";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const [order] = await db.select({ key: schema.vehicleOrders.screenshotKey, type: schema.vehicleOrders.screenshotType })
    .from(schema.vehicleOrders).where(and(eq(schema.vehicleOrders.id, id), user.role === "admin" ? undefined : eq(schema.vehicleOrders.userId, user.id)));
  if (!order) return new Response("Not found", { status: 404 });
  const bytes = await readPrivateFile(order.key);
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": order.type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox", "Content-Disposition": "inline",
  } });
}
