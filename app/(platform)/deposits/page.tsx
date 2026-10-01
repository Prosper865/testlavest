import Link from "next/link";
import { asc, ne } from "drizzle-orm";
import { requireUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { listVisiblePlans } from "@/features/plans/queries";
import { DepositCheckout } from "@/features/payments/deposit-checkout";
import { PaymentHistory } from "@/features/payments/payment-history";
import styles from "@/features/payments/checkout.module.css";

export const metadata = { title: "Deposit with a wallet" };

export default async function DepositsPage() {
  await requireUser("/deposits");
  const db = await getDb();
  const [plans, methods] = await Promise.all([
    listVisiblePlans(),
    db.select({ id: schema.paymentMethods.id, name: schema.paymentMethods.name, network: schema.paymentMethods.network, address: schema.paymentMethods.address })
      .from(schema.paymentMethods).where(ne(schema.paymentMethods.address, ""))
      .orderBy(asc(schema.paymentMethods.name), asc(schema.paymentMethods.network)),
  ]);
  return <div className={styles.stack}>
    <Link href="/dashboard">← Back to dashboard</Link>
    <div><span className={styles.badge}> DEPOSIT</span><h1>wallet deposit</h1><p>Select your plan and the payment method, copy the receiveing address, and upload the payment screenshot </p></div>
    <DepositCheckout plans={plans.map(({ id, name, minInvestment, maxInvestment }) => ({ id, name, minInvestment, maxInvestment }))} methods={methods} submissionId={crypto.randomUUID()} />
    <PaymentHistory />
  </div>;
}
