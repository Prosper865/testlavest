import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/** The user's latest submission, limited to what the status page shows. */
export async function getLatestKyc(userId: string) {
  const db = await getDb();
  const latest = await db.query.kycSubmissions.findFirst({
    where: eq(schema.kycSubmissions.userId, userId),
    orderBy: desc(schema.kycSubmissions.submittedAt),
    columns: { id: true, status: true, submittedAt: true, reviewedAt: true, reviewNote: true, documentType: true },
  });
  return latest ?? null;
}
