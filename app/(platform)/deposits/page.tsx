import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { listVisiblePlans } from "@/features/plans/queries";
import { DepositCheckout } from "@/features/payments/deposit-checkout";
import { listPayableMethods } from "@/features/payments/method-queries";
import { PaymentHistory } from "@/features/payments/payment-history";
import styles from "@/features/payments/checkout.module.css";
import { Icon } from "@/components/ui";

export const metadata = { title: "Add funds" };

export default async function DepositsPage() {
  await requireUser("/deposits");
  const [plans, methods] = await Promise.all([listVisiblePlans(), listPayableMethods()]);
  return <div className={styles.stack}>
    <Link href="/dashboard"><Icon name="arrow-left" /> Back to dashboard</Link>
    <div><span className={styles.badge}> DEPOSIT</span><h1>Add funds</h1><p>Select your plan, pay by crypto wallet or bank transfer, and upload your proof of payment.</p></div>
    <DepositCheckout plans={plans.map(({ id, name, minInvestment, maxInvestment }) => ({ id, name, minInvestment, maxInvestment }))} methods={methods} submissionId={crypto.randomUUID()} />
    <PaymentHistory />
  </div>;
}
