import { listVisiblePlans } from "@/features/plans/queries";
import { PlanCard } from "@/features/plans/components/plan-card";
import { PaymentHistory } from "@/features/payments/payment-history";
import styles from "@/features/payments/checkout.module.css";

export const metadata = { title: "Plans and payment status" };

export default async function PlansPage() {
  const plans = await listVisiblePlans();
  return <div className={styles.stack}>
    <div><h1>Choose your plan</h1><p>Select a plan, choose a wallet, and submit a screenshot for review.</p></div>
    <PaymentHistory />
    <div className={styles.grid}>{plans.map((plan, index) => <PlanCard key={plan.id} plan={plan} index={index} />)}</div>
    {!plans.length && <p className={styles.notice}>No plans are available yet. Check back soon.</p>}
  </div>;
}
