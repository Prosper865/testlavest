"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { CLOSED_MESSAGE, instrumentHref, isOpenForTrading, type Instrument } from "../instruments";
import { useQuotes } from "../quotes";
import { MarketLogo } from "./market-logo";
import { PriceChange } from "./price-change";
import { PriceChart } from "./price-chart";
import styles from "./market-terminal.module.css";

type Props = { instruments: Instrument[]; initialSymbol?: string; label?: string };

/** Instrument list plus a full trading chart for the selected one. Works for stocks and crypto. */
export function MarketTerminal({ instruments, initialSymbol, label = "Choose an asset" }: Props) {
  // Only open instruments (Tesla and SpaceX) can be selected; the rest are listed but inactive.
  const open = instruments.filter(isOpenForTrading);
  const [symbol, setSymbol] = useState(initialSymbol ?? open[0]?.symbol ?? "");
  const quotes = useQuotes();
  const selected = open.find(item => item.symbol === symbol) ?? open[0];
  const quote = selected ? quotes[selected.symbol] : undefined;
  const href = selected && instrumentHref(selected);
  const subtitle = selected?.kind === "crypto" ? "Cryptocurrency · 24/7 market" : selected?.sector;

  return (
    <div className={styles.terminal}>
      <div className={styles.list} role="group" aria-label={label}>
        <div className={styles.listHead}><span>Symbol</span><span>Last · Chg</span></div>
        {instruments.map(item => (
          <button key={item.symbol} type="button" className={styles.row} aria-pressed={item.symbol === selected?.symbol} data-static={!isOpenForTrading(item) || undefined} tabIndex={isOpenForTrading(item) ? undefined : -1} onClick={isOpenForTrading(item) ? () => setSymbol(item.symbol) : undefined}>
            <MarketLogo symbol={item.symbol} className={styles.rowLogo} />
            <div><b>{item.symbol}</b><small>{item.name}</small></div>
            <div className={styles.rowQuote}>
              {formatPrice(quotes[item.symbol].price, item.decimals)}
              <PriceChange value={quotes[item.symbol].change} />
            </div>
          </button>
        ))}
      </div>
      {!selected || !quote ? <div className={styles.main}><p className={styles.closedNote}>Rates are shown for reference. {CLOSED_MESSAGE}</p></div> : <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <div className={styles.name}>
              <MarketLogo symbol={selected.symbol} />
              <div><h3>{selected.name}</h3><p>{selected.symbol} · {subtitle} · USD</p></div>
            </div>
            <div className={styles.price}>
              <b>{formatPrice(quote.price, selected.decimals)}</b>
              <PriceChange value={quote.change} arrow />
              <span className={styles.live}><i aria-hidden="true" />LIVE</span>
            </div>
          </div>
          {href && <ButtonLink href={href} size="sm">Trade {selected.symbol}</ButtonLink>}
        </div>
        <PriceChart key={selected.symbol} symbol={selected.symbol} height={400} />
      </div>}
    </div>
  );
}
