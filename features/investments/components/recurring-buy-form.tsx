"use client";

import { useState } from "react";
import { Button, Eyebrow, Field, Panel, SegmentedControl, StatusMessage } from "@/components/ui";
import { getInstrument } from "@/features/market/instruments";
import { portfolioActions, type Frequency } from "@/features/portfolio/store";
import styles from "./investments.module.css";

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
] as const;

/** Dollar-cost averaging: buy a fixed dollar amount of a stock or coin on a schedule. */
export function RecurringBuyForm({ symbol }: { symbol: string }) {
  const [amount, setAmount] = useState("50");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [notice, setNotice] = useState("");
  const name = getInstrument(symbol)?.name ?? symbol;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setNotice(portfolioActions.createPlan(`crypto:${symbol}`, name, Number(amount), frequency, symbol).message);
  }

  return (
    <Panel className={styles.recurring} aria-label={`Recurring ${symbol} buy`}>
      <form onSubmit={submit}>
        <Eyebrow>Automated · recurring buy</Eyebrow>
        <h2>Buy {name} on a schedule.</h2>
        <p className="muted">Spread your purchases over time. The first buy runs today at the current price.</p>
        <Field label="Amount each time (USD)" hint="Minimum $25.">
          <input type="number" min="25" step="1" required value={amount} onChange={event => setAmount(event.target.value)} />
        </Field>
        <Field label="Frequency" group>
          <SegmentedControl variant="tabs" label="Buy frequency" options={frequencies} value={frequency} onChange={setFrequency} />
        </Field>
        <Button type="submit" variant="outline" block arrow="↗">Start recurring buy</Button>
        <StatusMessage>{notice}</StatusMessage>
      </form>
    </Panel>
  );
}
