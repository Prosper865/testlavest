"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui";
import { cryptoAssets, forexPairs, stocks } from "@/features/market/instruments";
import { useQuotes } from "@/features/market/quotes";
import { MarketLogo } from "@/features/market/components/market-logo";
import { MarketTerminal } from "@/features/market/components/market-terminal";
import { MiniChart } from "@/features/market/components/mini-chart";
import { PriceChange } from "@/features/market/components/price-change";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import styles from "./markets.module.css";
import { Icon } from "@/components/ui";

const tabs = [
  { id: "Stocks", icon: "trend-up", note: "Trade shares of the companies shaping tomorrow." },
  { id: "Crypto", icon: "crypto", note: "Buy and sell digital assets 24/7, from $1." },
  { id: "Forex", icon: "globe", note: "Currency markets are a discovery preview; trading." },
] as const;
type TabId = (typeof tabs)[number]["id"];

/** Forex has no trading yet, so it keeps simple quote cards instead of the full terminal. */
function ForexPreview() {
  const quotes = useQuotes();
  return (
    <div className={styles.grid}>
      {forexPairs.map(pair => {
        const quote = quotes[pair.symbol];
        return (
          <article key={pair.symbol} className={styles.card}>
            <div className={styles.title}>
              <MarketLogo symbol={pair.symbol} />
              <div><h3>{pair.name}</h3><span>{pair.symbol}</span></div>
              <span className={styles.type}>Forex</span>
            </div>
            <div className={styles.quote}>
              <strong>{formatPrice(quote.price, pair.decimals, false)}</strong>
              <PriceChange value={quote.change} arrow />
            </div>
            <MiniChart symbol={pair.symbol} className={styles.mini} />
            <div className={styles.foot}><span>Market discovery preview</span><span className={styles.badge}>PREVIEW</span></div>
          </article>
        );
      })}
    </div>
  );
}

export function GlobalMarkets() {
  const [tabId, setTabId] = useState<TabId>("Stocks");
  const tab = tabs.find(item => item.id === tabId)!;

  return (
    <section className={cn("shell", styles.section)} id="asset-markets" aria-labelledby="markets-heading">
      <SectionHeading
        id="markets-heading"
        eyebrow="Connected to a world of opportunity"
        title={<>Different markets.<br /><span className="accent-text">One ambitious mindset.</span></>}
        aside={<>From the world’s most recognized companies<br />to the next generation of digital assets.</>}
      />
      <div className={styles.tabs} role="group" aria-label="Market category">
        {tabs.map(item => (
          <button key={item.id} aria-pressed={item.id === tabId} onClick={() => setTabId(item.id)}><Icon name={item.icon} /> <span>{item.id}</span></button>
        ))}
        <small>LIVE QUOTES · NOT REAL MARKET DATA</small>
      </div>
      <p className={styles.tabNote}>{tab.note}</p>
      {tabId === "Stocks" && <MarketTerminal key="stocks" instruments={stocks} label="Choose a stock" />}
      {tabId === "Crypto" && <MarketTerminal key="crypto" instruments={cryptoAssets} label="Choose a coin" />}
      {tabId === "Forex" && <ForexPreview />}
    </section>
  );
}
