"use client";



import { useState } from "react";

import { Button, Eyebrow, Field, Panel, SegmentedControl, StatusMessage } from "@/components/ui";

import { useQuote } from "@/features/market/quotes";

import { portfolioActions, usePortfolio } from "@/features/portfolio/store";

import { formatAmount, formatPrice, money } from "@/lib/format";

import { getInstrument } from "@/features/market/instruments";

import styles from "./crypto.module.css";



type Side = "Buy" | "Sell";

const quickBuys = [25, 100, 500, 1000];



/** Fractional crypto orders: buy by dollar amount, sell by coin amount. */

export function CryptoOrderTicket({ symbol }: { symbol: string }) {

  const [side, setSide] = useState<Side>("Buy");

  const [amount, setAmount] = useState("100");

  const [notice, setNotice] = useState("");

  const [trading, setTrading] = useState(false);

  const quote = useQuote(symbol);

  const { cash, crypto } = usePortfolio();

  const balance = crypto[symbol] ?? 0;

  const decimals = getInstrument(symbol)?.decimals ?? 2;

  const value = Number(amount) > 0 ? Number(amount) : 0;



  function switchSide(next: Side) {

    setSide(next);

    setAmount(next === "Buy" ? "100" : "");

    setNotice("");

  }



  async function submit(event: React.FormEvent) {

    event.preventDefault();

    if (trading) return;

    setTrading(true);

    setNotice("Processing order…");

    const result = side === "Buy" ? await portfolioActions.buyCrypto(symbol, value) : await portfolioActions.sellCrypto(symbol, value);

    setNotice(result.message);

    setTrading(false);

  }



  return (

    <Panel className={styles.ticket} aria-label={`Trade ${symbol}`}>

      <form onSubmit={submit}>

        <Eyebrow>Crypto trading · 24/7</Eyebrow>

        <h2>{side} {symbol}</h2>

        <SegmentedControl variant="tabs" label="Order side" options={["Buy", "Sell"] as const} value={side} onChange={switchSide} />

        {side === "Buy" ? (

          <Field label="Amount (USD)" hint={`${money(cash)} buying power`}>

            <input type="number" min="1" step="0.01" required inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} />

          </Field>

        ) : (

          <Field label={`Amount (${symbol})`} hint={`You hold ${formatAmount(balance, 8)} ${symbol}`}>

            <input type="number" min="0" step="any" required inputMode="decimal" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} />

          </Field>

        )}

        <div className={styles.amountRow}>

          {side === "Buy"

            ? quickBuys.map(usd => <button key={usd} type="button" onClick={() => setAmount(String(usd))}>${usd}</button>)

            : [0.25, 0.5, 1].map(share => <button key={share} type="button" disabled={!balance} onClick={() => setAmount(String(balance * share))}>{share === 1 ? "Max" : `${share * 100}%`}</button>)}

        </div>

        <div className={styles.estimate}>

          <span>You receive (est.)</span>

          <b>{side === "Buy" ? `${formatAmount(value / quote.price, 8)} ${symbol}` : money(value * quote.price)}</b>

        </div>

        <div className={styles.estimate}>

          <span>Price</span>

          <span>{formatPrice(quote.price, decimals)} per {symbol}</span>

        </div>

        <Button type="submit" disabled={trading} block arrow="arrow-up-right">{side} {symbol} with funds</Button>

        <StatusMessage>{notice}</StatusMessage>

      </form>

    </Panel>

  );

}

