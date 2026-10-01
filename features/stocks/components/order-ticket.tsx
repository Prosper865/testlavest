"use client";



import { useState } from "react";

import { Button, Eyebrow, Field, Panel, SegmentedControl, StatusMessage } from "@/components/ui";

import { useQuote } from "@/features/market/quotes";

import { portfolioActions, usePortfolio } from "@/features/portfolio/store";

import { formatShares, money } from "@/lib/format";

import styles from "./stocks.module.css";



type Side = "Buy" | "Sell";

type Mode = "Dollars" | "Shares";



/** Market order ticket. "Dollars" places a fractional order, e.g. $50 of TSLA. */

export function OrderTicket({ symbol }: { symbol: string }) {

  const [side, setSide] = useState<Side>("Buy");

  const [mode, setMode] = useState<Mode>("Dollars");

  const [amount, setAmount] = useState("100");

  const [notice, setNotice] = useState("");

  const [trading, setTrading] = useState(false);

  const quote = useQuote(symbol);

  const { cash, holdings } = usePortfolio();

  const held = holdings[symbol] ?? 0;

  const value = Number(amount) > 0 ? Number(amount) : 0;



  function reset(nextMode: Mode) {

    setMode(nextMode);

    setAmount(nextMode === "Dollars" ? "100" : "1");

    setNotice("");

  }



  async function submit(event: React.FormEvent) {

    event.preventDefault();

    if (trading) return;

    setTrading(true);

    setNotice("Processing order…");

    const result = mode === "Dollars"

      ? await portfolioActions.tradeStockDollars(symbol, side, value)

      : await portfolioActions.tradeStock(symbol, side, value);

    setNotice(result.message);

    setTrading(false);

  }



  return (

    <Panel className={styles.ticket} aria-label={`Trade ${symbol}`}>

      <form onSubmit={submit}>

        <Eyebrow>Practice trading</Eyebrow>

        <h2>{side} {symbol}</h2>

        <SegmentedControl variant="tabs" label="Order side" options={["Buy", "Sell"] as const} value={side} onChange={next => { setSide(next); setNotice(""); }} />

        <Field label="Order in" group>

          <SegmentedControl label="Order in dollars or shares" options={["Dollars", "Shares"] as const} value={mode} onChange={reset} />

        </Field>

        {mode === "Dollars" ? (

          <Field label="Amount (USD)" hint="Fractional shares: invest any amount from $1.">

            <input type="number" min="1" step="0.01" required inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} />

          </Field>

        ) : (

          <Field label="Number of shares">

            <input type="number" min="1" step="1" required value={amount} onChange={event => setAmount(event.target.value)} />

          </Field>

        )}

        {side === "Sell" && mode === "Dollars" && held > 0 && (

          <button type="button" className={styles.sellAll} onClick={() => setAmount((Math.floor(held * quote.price * 100) / 100).toFixed(2))}>Sell all ({money(held * quote.price)})</button>

        )}

        <div className={styles.estimate}>

          <span>{mode === "Dollars" ? "Estimated shares" : "Estimated total"}</span>

          <b>{mode === "Dollars" ? formatShares(value / quote.price) : money(value * quote.price)}</b>

        </div>

        <p className="muted">You own {formatShares(held)} shares · {money(cash)} buying power. Market order at the simulated price when you submit.</p>

        <Button type="submit" disabled={trading} block arrow="arrow-up-right">{side} with funds</Button>

        <StatusMessage>{notice}</StatusMessage>

      </form>

    </Panel>

  );

}

