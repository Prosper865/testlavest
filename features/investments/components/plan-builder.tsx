"use client";

import { useState } from "react";
import { Button, Eyebrow, Field, Panel, SegmentedControl, StatusMessage } from "@/components/ui";
import { portfolioActions, type Frequency } from "@/features/portfolio/store";
import { money } from "@/lib/format";
import { getStrategy, strategies } from "../strategies";
import styles from "./investments.module.css";

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
] as const;
const perYear: Record<Frequency, number> = { weekly: 52, biweekly: 26, monthly: 12 };

type Props = { strategyId: string; onStrategyChange: (id: string) => void };

export function PlanBuilder({ strategyId, onStrategyChange }: Props) {
  const [amount, setAmount] = useState("100");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [notice, setNotice] = useState("");
  const value = Number(amount);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const strategy = getStrategy(strategyId)!;
    setNotice((await portfolioActions.createPlan(strategy.id, strategy.name, value, frequency)).message);
  }

  return (
    <Panel id="plan-builder" className={styles.builder} aria-label="Create a recurring plan">
      <form onSubmit={submit}>
        <Eyebrow>Automated investing</Eyebrow>
        <h2>Set up a recurring plan.</h2>
        <p className="muted">The first contribution runs today, then automatically on your schedule.</p>
        <Field label="Strategy">
          <select value={strategyId} onChange={event => onStrategyChange(event.target.value)}>
            {strategies.map(strategy => <option key={strategy.id} value={strategy.id}>{strategy.name} · {strategy.risk}</option>)}
          </select>
        </Field>
        <Field label="Contribution amount (USD)" hint="Minimum $25 per contribution.">
          <input type="number" min="25" step="1" required value={amount} onChange={event => setAmount(event.target.value)} />
        </Field>
        <Field label="Frequency" group>
          <SegmentedControl variant="tabs" label="Contribution frequency" options={frequencies} value={frequency} onChange={setFrequency} />
        </Field>
        <div className={styles.summaryLine}>
          <span>Planned per year</span>
          <b>{money((Number.isFinite(value) ? value : 0) * perYear[frequency])}</b>
        </div>
        <Button type="submit" block arrow="↗">Start automated plan</Button>
        <StatusMessage>{notice}</StatusMessage>
      </form>
    </Panel>
  );
}
