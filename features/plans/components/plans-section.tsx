import { Eyebrow } from "@/components/ui";
import { listVisiblePlans } from "../queries";
import { PlanCard } from "./plan-card";
import styles from "./plans.module.css";

/** Homepage plans section. Plans come from the database and are managed in the admin console. */
export async function PlansSection() {
  const plans = await listVisiblePlans();
  return (
    <section className={styles.section} id="plans" aria-labelledby="plans-heading">
      <div className="shell">
        <div className={styles.heading}>
          <Eyebrow dot>Investment plans</Eyebrow>
          <h2 id="plans-heading">Choose how you grow.</h2>
          <p>Clear minimums, fees, and withdrawal terms for every plan. Pick the one that matches your goals and how much risk you&apos;re comfortable with.</p>
          <span className={styles.demoTag}>Plans · figures are illustrative</span>
        </div>
        {plans.length === 0 ? <p className={styles.empty}>New plans are coming soon.</p> : (
          <div className={styles.grid}>
            {plans.map((plan, index) => <PlanCard key={plan.id} plan={plan} index={index} />)}
          </div>
        )}
        <p className={styles.disclaimer}>*Plan figures are illustrative. Returns are not guaranteed. The value of investments can go down as well as up, and you may get back less than you invest.</p>
      </div>
    </section>
  );
}
