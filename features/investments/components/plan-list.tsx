"use client";

import { useState } from "react";
import { Button, EmptyState, Panel, PanelHeader, StatusMessage } from "@/components/ui";
import { getInstrument } from "@/features/market/instruments";
import { portfolioActions, usePortfolio, type Frequency, type RecurringPlan } from "@/features/portfolio/store";
import { formatDate, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getStrategy } from "../strategies";
import styles from "./investments.module.css";

const frequencyLabel: Record<Frequency, string> = { weekly: "weekly", biweekly: "every 2 weeks", monthly: "monthly" };

function planName(plan: RecurringPlan) {
  if (plan.goal) return `${plan.goal.vehicleName} savings goal`;
  if (plan.asset) return `${getInstrument(plan.asset)?.name ?? plan.asset} recurring buy`;
  return getStrategy(plan.strategyId)?.name ?? "Strategy";
}

type Props = { title?: string; filter?: "strategies" | "crypto"; asset?: string; emptyText?: string };

export function PlanList({ title = "Your automated plans", filter, asset, emptyText = "No recurring plans yet. Choose a strategy and set a contribution to get started." }: Props) {
  const { plans: allPlans } = usePortfolio();
  const [notice, setNotice] = useState("");
  const plans = allPlans.filter(plan =>
    (asset ? plan.asset === asset : true) &&
    (filter === "crypto" ? Boolean(plan.asset) : filter === "strategies" ? !plan.asset : true));

  return (
    <Panel aria-label={title}>
      <PanelHeader title={title} />
      {plans.length === 0 ? (
        <EmptyState>{emptyText}</EmptyState>
      ) : (
        <div className={styles.plans}>
          {plans.map(plan => {
            const active = plan.status === "active";
            const noun = plan.asset ? "buy" : "contribution";
            return (
              <article key={plan.id} className={cn(styles.plan, !active && styles.paused)}>
                <div>
                  <h3>{planName(plan)}<span className={styles.status}>{plan.status}</span></h3>
                  <p>{money(plan.amount)} {frequencyLabel[plan.frequency]} · {plan.contributions} {noun}{plan.contributions === 1 ? "" : "s"}<br />{active ? `Next ${noun} ${formatDate(plan.nextRun)}` : `Paused, no ${noun}s scheduled`}</p>
                </div>
                <div className={styles.planValue}>{money(plan.invested)}<small>{plan.goal ? `Saved of ${money(plan.goal.target)}` : plan.asset ? `Spent on ${plan.asset}` : "Contributed"}</small></div>
                <div className={styles.planActions}>
                  <Button size="sm" variant="outline" onClick={() => setNotice(portfolioActions.contribute(plan.id).message)}>{plan.asset ? "Buy now" : "Contribute now"}</Button>
                  <Button size="sm" variant="outline" onClick={() => portfolioActions.togglePlan(plan.id)}>{active ? "Pause" : "Resume"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setNotice(portfolioActions.removePlan(plan.id).message)}>{plan.asset ? "Stop" : "Close plan"}</Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <StatusMessage>{notice}</StatusMessage>
    </Panel>
  );
}
