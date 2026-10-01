import { ButtonLink } from "@/components/ui";
import type { InvestmentPlan, RiskLevel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import styles from "./plans.module.css";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const riskLabels: Record<RiskLevel, string> = { low: "Low risk", moderate: "Moderate risk", high: "High risk" };

type Props = { plan: InvestmentPlan; index: number; ctaHref?: string };

/** A single plan card: headline minimum, a spec list, and features. Shared by the website and the admin preview. */
export function PlanCard({ plan, index, ctaHref = `/plans/${plan.id}` }: Props) {
  const specs: [string, string][] = [
    ["Min", usd.format(plan.minInvestment)],
    ["Max", plan.maxInvestment === null ? "No maximum" : usd.format(plan.maxInvestment)],
    ["Duration", plan.duration],
    ["Withdrawals", plan.withdrawals],
    ["Est. return*", plan.expectedReturn],
    ["Fee", plan.fee],
  ];
  return (
    <article className={cn(styles.card, plan.featured && styles.featured)}>
      <div className={styles.top}>
        <span className={styles.label}>{plan.featured ? "Most popular" : `Plan ${String(index + 1).padStart(2, "0")}`}</span>
        <span className={cn(styles.risk, styles[plan.riskLevel])}>{riskLabels[plan.riskLevel]}</span>
      </div>
      <h3>{plan.name}</h3>
      <p className={styles.tagline}>{plan.tagline}</p>
      <p className={styles.from}>Start from<b>{usd.format(plan.minInvestment)}</b></p>
      <ul className={styles.specs}>
        {specs.map(([label, value]) => <li key={label}><span>{label}</span><b>{value}</b></li>)}
      </ul>
      <ul className={styles.features}>
        {plan.features.map(feature => <li key={feature}>{feature}</li>)}
      </ul>
      <div className={styles.cta}>
        <ButtonLink href={ctaHref} variant={plan.featured ? "outline" : "primary"}>Start with {plan.name}</ButtonLink>
      </div>
    </article>
  );
}
