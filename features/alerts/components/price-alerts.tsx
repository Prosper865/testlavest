"use client";

import { useState } from "react";
import { Button, EmptyState, Panel, PanelHeader, StatusMessage } from "@/components/ui";
import { useQuote } from "@/features/market/quotes";
import { portfolioActions, usePortfolio, type PriceAlert } from "@/features/portfolio/store";
import { formatDateTime, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import styles from "./alerts.module.css";

/** Create and manage price alerts for one symbol. Alerts fire while the platform is open. */
export function PriceAlerts({ symbol }: { symbol: string }) {
  const quote = useQuote(symbol);
  const { alerts } = usePortfolio();
  const [direction, setDirection] = useState<PriceAlert["direction"]>("below");
  const [price, setPrice] = useState("");
  const [notice, setNotice] = useState("");
  const mine = alerts.filter(alert => alert.symbol === symbol);
  const suggested = (quote.price * (direction === "below" ? 0.95 : 1.05)).toFixed(2);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = portfolioActions.addAlert(symbol, direction, Number(price || suggested));
    setNotice(result.message);
    if (result.ok) setPrice("");
  }

  return (
    <Panel aria-label={`${symbol} price alerts`}>
      <PanelHeader title="Price alerts" />
      <form className={styles.form} onSubmit={submit}>
        <label>
          <span>Notify me when {symbol} goes</span>
          <select value={direction} onChange={event => setDirection(event.target.value as PriceAlert["direction"])}>
            <option value="below">below</option>
            <option value="above">above</option>
          </select>
        </label>
        <label>
          <span>Price (USD)</span>
          <input type="number" min="0.01" step="0.01" inputMode="decimal" placeholder={suggested} value={price} onChange={event => setPrice(event.target.value)} />
        </label>
        <Button type="submit" size="sm">Set alert</Button>
      </form>
      <p className={styles.hint}>Now {money(quote.price)}. Leave the price empty to use {money(Number(suggested))} (5% {direction === "below" ? "lower" : "higher"}).</p>
      <StatusMessage>{notice}</StatusMessage>
      {mine.length === 0 ? (
        <EmptyState>No alerts for {symbol} yet.</EmptyState>
      ) : (
        <ul className={styles.list}>
          {mine.map(alert => (
            <li key={alert.id} className={cn(styles.alert, alert.triggeredAt !== undefined && styles.fired)}>
              <span className={styles.badge}>{alert.triggeredAt ? "Triggered" : "Active"}</span>
              <div>
                <b>{alert.direction === "above" ? "Above" : "Below"} {money(alert.price)}</b>
                <small>{alert.triggeredAt ? `Hit ${money(alert.triggeredPrice ?? alert.price)} · ${formatDateTime(alert.triggeredAt)}` : `Set ${formatDateTime(alert.createdAt)}`}</small>
              </div>
              <button type="button" onClick={() => portfolioActions.removeAlert(alert.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
