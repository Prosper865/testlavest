import { AccountProvider } from "@/features/account";
import { requireUser } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { paymentSummary } from "@/features/payments/plan-payment-service";

// The mobile app needs the signed-in account too: it binds the demo portfolio to the user
// and gates trading until identity verification is approved.
export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const payments = await paymentSummary(await getDb(), user.id);
  return <AccountProvider key={user.id} user={user} initialPayments={payments}>{children}</AccountProvider>;
}
