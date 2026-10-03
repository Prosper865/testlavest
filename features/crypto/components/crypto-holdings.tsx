"use client";

import Link from "next/link";
import { EmptyState, Panel, PanelHeader } from "@/components/ui";
import { cryptoAssets } from "@/features/market/instruments";
import { MarketLogo } from "@/features/market/components/market-logo";
import { PriceChange } from "@/features/market/components/price-change";
import { usePortfolioValuation } from "@/features/portfolio/valuation";
import { formatAmount, money } from "@/lib/format";
import styles from "./crypto.module.css";
import { Icon } from "@/components/ui";

export function CryptoHoldings() {
  const { portfolio, quotes, crypto } = usePortfolioValuation();
  const held = cryptoAssets.filter(asset => (portfolio.crypto[asset.symbol] ?? 0) > 0);
  return (
    <Panel aria-labelledby="crypto-holdings-heading">
      <PanelHeader title={<span id="crypto-holdings-heading">Crypto holdings · {money(crypto)}</span>} action={<Link href="/wallet" className="accent-text muted">Deposit &amp; withdraw <Icon name="arrow-right" /></Link>} />
      {held.length === 0 ? (
        <EmptyState>You don’t hold any crypto. Crypto buying is not available right now.</EmptyState>
      ) : (
        <div className={styles.holdings}>
          {held.map(asset => {
            const units = portfolio.crypto[asset.symbol];
            const quote = quotes[asset.symbol];
            return (
              <Link key={asset.symbol} href={`/crypto/${asset.symbol}`} className={styles.holding}>
                <MarketLogo symbol={asset.symbol} className={styles.holdingLogo} />
                <div><b>{asset.name}</b><small>{formatAmount(units, 8)} {asset.symbol}</small></div>
                <div className={styles.holdingValue}>{money(units * quote.price)}<small><PriceChange value={quote.change} /></small></div>
              </Link>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
