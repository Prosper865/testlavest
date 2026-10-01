import { getCurrentUser } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { paymentSummary } from "@/features/payments/plan-payment-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  return Response.json(await paymentSummary(await getDb(), user.id), { headers: { "Cache-Control": "private, no-store" } });
}
