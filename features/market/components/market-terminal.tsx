"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { instrumentHref, type Instrument } from "../instruments";
import { useQuotes } from "../quotes";
import { MarketLogo } from "./market-logo";
import { PriceChange } from "./price-change";
import { PriceChart } from "./price-chart";
import styles from "./market-terminal.module.css";

type Props = { instruments: Instrument[]; initialSymbol?: string; label?: string };

/** Instrument list plus a full trading chart for the selected one. Works for stocks and crypto. */
export function MarketTerminal({ instruments, initialSymbol, label = "Choose an asset" }: Props) {
  const [symbol, setSymbol] = useState(initialSymbol ?? instruments[0].symbol);
  const quotes = useQuotes();
  const selected = instruments.find(item => item.symbol === symbol) ?? instruments[0];
  const quote = quotes[selected.symbol];
  const href = instrumentHref(selected);
  const subtitle = selected.kind === "crypto" ? "Cryptocurrency · 24/7 market" : selected.sector;

  return (
    <div className={styles.terminal}>
      <div className={styles.list} role="group" aria-label={label}>
        <div className={styles.listHead}><span>Symbol</span><span>Last · Chg</span></div>
        {instruments.map(item => (
          <button key={item.symbol} type="button" className={styles.row} aria-pressed={item.symbol === selected.symbol} onClick={() => setSymbol(item.symbol)}>
            <MarketLogo symbol={item.symbol} className={styles.rowLogo} />
            <div><b>{item.symbol}</b><small>{item.name}</small></div>
            <div className={styles.rowQuote}>
              {formatPrice(quotes[item.symbol].price, item.decimals)}
              <PriceChange value={quotes[item.symbol].change} />
            </div>
          </button>
        ))}
      </div>
      <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <div className={styles.name}>
              <MarketLogo symbol={selected.symbol} />
              <div><h3>{selected.name}</h3><p>{selected.symbol} · {subtitle} · USD</p></div>
            </div>
            <div className={styles.price}>
              <b>{formatPrice(quote.price, selected.decimals)}</b>
              <PriceChange value={quote.change} arrow />
              <span className={styles.live}><i aria-hidden="true" />SIMULATED LIVE</span>
            </div>
          </div>
          {href && <ButtonLink href={href} size="sm">Trade {selected.symbol}</ButtonLink>}
        </div>
        <PriceChart key={selected.symbol} symbol={selected.symbol} height={400} />
      </div>
    </div>
  );
}
