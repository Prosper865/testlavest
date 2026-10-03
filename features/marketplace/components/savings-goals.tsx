"use client";

import { useState } from "react";
import { Button, ButtonLink, EmptyState, Eyebrow, Field, Panel, PanelHeader, SegmentedControl, StatusMessage } from "@/components/ui";
import { portfolioActions, usePortfolio, type Frequency } from "@/features/portfolio/store";
import { formatDate, money } from "@/lib/format";
import { vehicleName } from "../vehicles";
import { useVehicles } from "./vehicles-provider";
import styles from "./marketplace.module.css";

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;
const periodsPerMonth: Record<Frequency, number> = { weekly: 52 / 12, biweekly: 26 / 12, monthly: 1 };

type PlannerProps = { vehicleId?: string; onVehicleChange?: (id: string) => void };

/** Set up a savings goal toward a vehicle's price. Controlled when `vehicleId` is passed. */
export function SavingsGoalPlanner({ vehicleId, onVehicleChange }: PlannerProps) {
  const { listed, get } = useVehicles();
  const [ownVehicleId, setOwnVehicleId] = useState((listed[1] ?? listed[0])?.id ?? "");
  const [amount, setAmount] = useState("500");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [notice, setNotice] = useState("");
  const selectedId = vehicleId ?? ownVehicleId;
  const selected = get(selectedId);
  const vehicle = selected?.visible ? selected : listed[0];
  const perMonth = (Number(amount) || 0) * periodsPerMonth[frequency];
  const months = vehicle && perMonth > 0 ? Math.ceil(vehicle.price / perMonth) : 0;

  function select(id: string) {
    setOwnVehicleId(id);
    onVehicleChange?.(id);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!vehicle) return;
    const name = vehicleName(vehicle);
    setNotice((await portfolioActions.createPlan(`goal:${vehicle.id}`, name, Number(amount), frequency, undefined, { vehicleId: vehicle.id, vehicleName: name, target: vehicle.price })).message);
  }

  if (!vehicle) {
    return (
      <Panel id="save-for-tesla" className={styles.planner} aria-label="Save for your Tesla">
        <Eyebrow>Save for your Tesla</Eyebrow>
        <EmptyState>No cars are listed right now, so there is nothing to save toward yet.</EmptyState>
      </Panel>
    );
  }

  return (
    <Panel id="save-for-tesla" className={styles.planner} aria-label="Save for your Tesla">
      <form onSubmit={submit}>
        <Eyebrow>Save for your Tesla</Eyebrow>
        <h2>Invest toward your next car.</h2>
        <p className="muted">Pick a vehicle and an amount. We set it aside on your schedule and tell you when you can order it.</p>
        <Field label="Vehicle">
          <select value={vehicle.id} onChange={event => select(event.target.value)}>
            {listed.map(item => <option key={item.id} value={item.id}>{vehicleName(item)} · {money(item.price)}</option>)}
          </select>
        </Field>
        <Field label="Amount each time (USD)" hint="Minimum $25.">
          <input type="number" min="25" step="1" required value={amount} onChange={event => setAmount(event.target.value)} />
        </Field>
        <Field label="Frequency" group>
          <SegmentedControl variant="tabs" label="Saving frequency" options={frequencies} value={frequency} onChange={setFrequency} />
        </Field>
        <div className={styles.goalEstimate}>
          <span>Goal</span><b>{money(vehicle.price)}</b>
          <span>At this pace</span><b>{months ? `about ${months} month${months === 1 ? "" : "s"}` : "—"}</b>
        </div>
        <Button type="submit" block arrow="arrow-up-right">Start saving</Button>
        <StatusMessage>{notice}</StatusMessage>
      </form>
    </Panel>
  );
}

/** Progress on every savings goal, with an order button once a goal is reached. */
export function SavingsGoalsList() {
  const { plans } = usePortfolio();
  const [notice, setNotice] = useState("");
  const goals = plans.filter(plan => plan.goal);

  return (
    <Panel aria-label="Your savings goals">
      <PanelHeader title="Your savings goals" />
      {goals.length === 0 ? (
        <EmptyState>No savings goals yet. Choose a car and start saving toward it.</EmptyState>
      ) : (
        <div className={styles.goals}>
          {goals.map(plan => {
            const goal = plan.goal!;
            const progress = Math.min(1, plan.invested / goal.target);
            const reached = progress >= 1;
            return (
              <article key={plan.id} className={styles.goal}>
                <div className={styles.goalHead}>
                  <div><b>{goal.vehicleName}</b><small>{money(plan.amount)} {plan.frequency} · {plan.status === "active" && !reached ? `next ${formatDate(plan.nextRun)}` : reached ? "goal reached" : "paused"}</small></div>
                  <strong>{Math.floor(progress * 100)}%</strong>
                </div>
                <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress * 100)} aria-label={`${goal.vehicleName} savings progress`}>
                  <span style={{ width: `${progress * 100}%` }} />
                </div>
                <p className={styles.goalAmounts}>{money(plan.invested)} saved of {money(goal.target)}</p>
                <div className={styles.goalActions}>
                  {reached ? (
                    <ButtonLink size="sm" href={`/marketplace/${goal.vehicleId}/order`}>Order this car</ButtonLink>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={async () => setNotice((await portfolioActions.contribute(plan.id)).message)}>Add {money(plan.amount)} now</Button>
                      <Button size="sm" variant="outline" onClick={() => portfolioActions.togglePlan(plan.id)}>{plan.status === "active" ? "Pause" : "Resume"}</Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={async () => setNotice((await portfolioActions.removePlan(plan.id)).message)}>Close goal</Button>
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
