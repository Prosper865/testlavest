"use client";

import { useState } from "react";
import { useAccount } from "@/features/account";
import type { InvestmentPlan } from "@/lib/db/schema";
import { money } from "@/lib/format";
import { CheckoutForm } from "./checkout-form";
import type { PayMethod } from "./methods";
import styles from "./checkout.module.css";

type Plan = Pick<InvestmentPlan, "id" | "name" | "minInvestment" | "maxInvestment">;

export function DepositCheckout({ plans, methods, submissionId }: {
  plans: Plan[];
  methods: PayMethod[];
  submissionId: string;
}) {
  const { planPayments } = useAccount();
  const [selectedId, setSelectedId] = useState(plans.find(plan => !planPayments.payments.some(payment => payment.planId === plan.id && payment.status === "pending"))?.id ?? plans[0]?.id ?? "");
  const selected = plans.find(plan => plan.id === selectedId);
  const pending = planPayments.payments.some(payment => payment.planId === selectedId && payment.status === "pending");
  if (!selected) return <p className={styles.notice}>No plans are available for deposits yet. Please check back soon.</p>;
  return <section className={styles.card} aria-label="Deposit">
    <label className={styles.field} htmlFor="deposit-plan">Deposit for plan
      <select id="deposit-plan" value={selectedId} onChange={event => setSelectedId(event.target.value)}>
        {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} · from {money(plan.minInvestment)}</option>)}
      </select>
    </label>
    <div className={styles.stack}>
      {pending ? <p className={styles.notice}>Your deposit for {selected.name} is already under review. See its status below or select another plan.</p> :
        <CheckoutForm key={selected.id} plan={selected} methods={methods} submissionId={submissionId} />}
    </div>
  </section>;
}
