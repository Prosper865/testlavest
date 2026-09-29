"use client";

import { useState } from "react";
import { Button, Eyebrow, Field, Panel, SegmentedControl, StatusMessage } from "@/components/ui";
import { cryptoAssets } from "@/features/market/instruments";
import { useQuote } from "@/features/market/quotes";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { formatAmount, money } from "@/lib/format";
import styles from "./wallet.module.css";

type Direction = "Deposit" | "Withdraw";

export function TransferForm() {
  const [direction, setDirection] = useState<Direction>("Deposit");
  const [asset, setAsset] = useState(cryptoAssets[0].symbol);
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [notice, setNotice] = useState("");
  const quote = useQuote(asset);
  const { crypto } = usePortfolio();
  const value = Number(amount);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = direction === "Deposit"
      ? portfolioActions.depositCrypto(asset, value)
      : portfolioActions.withdrawCrypto(asset, value, destination);
    setNotice(result.message);
    if (result.ok) { setAmount(""); setDestination(""); }
  }

  return (
    <Panel className={styles.form} aria-label="Move crypto">
      <form onSubmit={submit}>
        <Eyebrow>Crypto wallet</Eyebrow>
        <h2>Deposit and withdraw.</h2>
        <SegmentedControl variant="tabs" label="Transfer direction" options={["Deposit", "Withdraw"] as const} value={direction} onChange={value => { setDirection(value); setNotice(""); }} />
        <Field label="Asset" hint={`Available: ${formatAmount(crypto[asset] ?? 0)} ${asset}`}>
          <select value={asset} onChange={event => setAsset(event.target.value)}>
            {cryptoAssets.map(item => <option key={item.symbol} value={item.symbol}>{item.name} ({item.symbol})</option>)}
          </select>
        </Field>
        <Field label={`Amount (${asset})`}>
          <input type="number" min="0" step="any" required inputMode="decimal" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} />
        </Field>
        {direction === "Withdraw" && (
          <Field label="Destination address">
            <input required autoComplete="off" spellCheck={false} value={destination} onChange={event => setDestination(event.target.value)} />
          </Field>
        )}
        <div className={styles.estimate}>
          <span>Estimated value</span>
          <b>{money((value > 0 ? value : 0) * quote.price)}</b>
        </div>
        <Button type="submit" block arrow="↗">{direction === "Deposit" ? "Simulate deposit" : "Simulate withdrawal"}</Button>
        <StatusMessage>{notice}</StatusMessage>
        <p className={styles.notice}>Demo only: no deposit addresses are issued and nothing is sent on-chain. Real transfers require a licensed custody provider and identity verification.</p>
      </form>
    </Panel>
  );
}
