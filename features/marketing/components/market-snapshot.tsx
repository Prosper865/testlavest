"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketLogo } from "@/features/market/components/market-logo";
import { PriceChange } from "@/features/market/components/price-change";
import { getInstrument, instrumentHref, type Instrument } from "@/features/market/instruments";
import { useQuotes } from "@/features/market/quotes";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import styles from "./market-snapshot.module.css";
import { Icon } from "@/components/ui";

// Tesla leads, then stocks and crypto alternate: one platform for both markets.
const order = ["TSLA", "BTC", "NVDA", "ETH", "AAPL", "SOL", "MSFT", "BNB", "GOOGL", "XRP", "META", "DOGE", "AMD", "ADA", "NFLX", "AVAX", "COIN", "LINK", "V"];
const items = order.map(symbol => getInstrument(symbol)).filter((item): item is Instrument => Boolean(item));

function TickerList({ duplicate = false }: { duplicate?: boolean }) {
  const quotes = useQuotes();
  return (
    <div className={cn(styles.list, duplicate && styles.duplicate)} aria-hidden={duplicate || undefined}>
      {items.map(item => {
        const quote = quotes[item.symbol];
        return (
          <Link key={item.symbol} href={instrumentHref(item) ?? "/dashboard"} className={styles.item} tabIndex={duplicate ? -1 : undefined}>
            <MarketLogo symbol={item.symbol} className={styles.logo} />
            <b>{item.symbol}</b>
            <span>{formatPrice(quote.price, item.decimals)}</span>
            <small><PriceChange value={quote.change} arrow /></small>
            {item.kind === "crypto" && <span className={styles.kind}>24/7</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function MarketSnapshot() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={cn(styles.strip, paused && styles.paused)} aria-label="Live market ticker">
      <div className={cn("shell", styles.inner)}>
        <div className={styles.badge}>
          <span className={styles.live}><i aria-hidden="true" />MARKETS LIVE</span>
          <small>Stocks · <b>Crypto 24/7</b> · Simulated</small>
        </div>
        <div className={styles.viewport}>
          <div className={styles.track} style={{ "--duration": `${items.length * 5}s` } as React.CSSProperties}>
            <TickerList />
            <TickerList duplicate />
          </div>
        </div>
        <div className={styles.aside}>
          <button type="button" className={styles.pause} aria-pressed={paused} aria-label={paused ? "Resume ticker" : "Pause ticker"} onClick={() => setPaused(!paused)}>
            <Icon name={paused ? "play" : "pause"} />
          </button>
          <Link href="/dashboard" className={styles.cta}>Trade from $1 <Icon name="arrow-right" /></Link>
        </div>
      </div>
    </section>
  );
}
