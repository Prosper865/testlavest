"use client";

import { useState } from "react";
import { Button, ButtonLink, Eyebrow, Field, Panel, StatusMessage } from "@/components/ui";
import { cryptoAssets } from "@/features/market/instruments";
import { useQuote } from "@/features/market/quotes";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { formatAmount, money } from "@/lib/format";
import styles from "./wallet.module.css";

export function TransferForm() {
  const [sending, setSending] = useState(false);
  const [asset, setAsset] = useState(cryptoAssets[0].symbol);
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [notice, setNotice] = useState("");
  const quote = useQuote(asset);
  const { crypto } = usePortfolio();
  const value = Number(amount);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = await portfolioActions.withdrawCrypto(asset, value, destination);
    setNotice(result.message);
    if (result.ok) { setAmount(""); setDestination(""); }
  }

  if (!sending) return <Panel className={styles.form} aria-label="Wallet deposit">
    <Eyebrow>Wallet deposit</Eyebrow><h2>Deposit with a wallet.</h2>
    <p>View the configured receiving addresses, copy your selected wallet address, and upload a payment screenshot for review.</p>
    <ButtonLink href="/deposits">Choose a deposit wallet</ButtonLink>
    <Button variant="outline" onClick={() => setSending(true)}>Send crypto</Button>
  </Panel>;

  return (
    <Panel className={styles.form} aria-label="Move crypto">
      <form onSubmit={submit}>
        <Eyebrow>Crypto wallet</Eyebrow>
        <h2>Send crypto.</h2>
        <Button type="button" variant="outline" onClick={() => setSending(false)}>Back to deposits</Button>
        <Field label="Asset" hint={`Available: ${formatAmount(crypto[asset] ?? 0)} ${asset}`}>
          <select value={asset} onChange={event => setAsset(event.target.value)}>
            {cryptoAssets.map(item => <option key={item.symbol} value={item.symbol}>{item.name} ({item.symbol})</option>)}
          </select>
        </Field>
        <Field label={`Amount (${asset})`}>
          <input type="number" min="0" step="any" required inputMode="decimal" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} />
        </Field>
          <Field label="Destination address">
            <input required autoComplete="off" spellCheck={false} value={destination} onChange={event => setDestination(event.target.value)} />
          </Field>
        <div className={styles.estimate}>
          <span>Estimated value</span>
          <b>{money((value > 0 ? value : 0) * quote.price)}</b>
        </div>
        <Button type="submit" block arrow="arrow-up-right">Send crypto</Button>
        <StatusMessage>{notice}</StatusMessage>
        <p className={styles.notice}>Simulated transfer only. Nothing is sent on-chain.</p>
      </form>
    </Panel>
  );
}
