"use client";

import Link from "next/link";
import { EmptyState, Panel, PanelHeader } from "@/components/ui";
import { MarketLogo } from "@/features/market/components/market-logo";
import { PriceChange } from "@/features/market/components/price-change";
import { formatShares, money } from "@/lib/format";
import { usePortfolioValuation } from "../valuation";
import styles from "./portfolio.module.css";
import { Icon } from "@/components/ui";

export function HoldingsPanel() {
  const { portfolio, quotes } = usePortfolioValuation();
  // Skip symbols no longer in the catalogue (e.g. from an older saved demo account).
  const positions = Object.entries(portfolio.holdings).filter(([symbol, shares]) => shares > 0 && quotes[symbol]);
  return (
    <Panel aria-labelledby="holdings-heading">
      <PanelHeader title={<span id="holdings-heading">Stock holdings</span>} action={<Link href="/stocks" className="accent-text muted">Browse stocks <Icon name="arrow-right" /></Link>} />
      {positions.length === 0 ? (
        <EmptyState>No holdings yet. Open a stock and place a buy order to get started.</EmptyState>
      ) : (
        <div className={styles.holdings}>
          {positions.map(([symbol, shares]) => (
            <Link key={symbol} href={`/stocks/${symbol}`} className={styles.holding}>
              <MarketLogo symbol={symbol} className={styles.holdingLogo} />
              <div><b>{symbol}</b><small>{formatShares(shares)} shares</small></div>
              <strong>{money(quotes[symbol].price * shares)}<small><PriceChange value={quotes[symbol].change} /></small></strong>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}
