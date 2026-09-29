"use client";

import { Panel, PanelHeader, Tag } from "@/components/ui";
import { cryptoAssets } from "@/features/market/instruments";
import { MarketLogo } from "@/features/market/components/market-logo";
import { PriceChange } from "@/features/market/components/price-change";
import { usePortfolioValuation } from "@/features/portfolio/valuation";
import { formatAmount, formatPrice, money } from "@/lib/format";
import styles from "./wallet.module.css";

export function WalletBalances() {
  const { portfolio, quotes, crypto } = usePortfolioValuation();
  return (
    <Panel aria-labelledby="wallet-heading">
      <PanelHeader title={<span id="wallet-heading">Crypto balances</span>} action={<Tag>Simulated live</Tag>} />
      <p className="muted">Total crypto value</p>
      <div className={styles.total}>{money(crypto)}</div>
      <div className={styles.assets}>
        {cryptoAssets.map(asset => {
          const quote = quotes[asset.symbol];
          const balance = portfolio.crypto[asset.symbol] ?? 0;
          return (
            <div key={asset.symbol} className={styles.asset}>
              <MarketLogo symbol={asset.symbol} />
              <div>
                <h3>{asset.name}</h3>
                <p>{formatPrice(quote.price, asset.decimals)} · <PriceChange value={quote.change} /></p>
              </div>
              <div className={styles.assetValue}>
                {formatAmount(balance)} {asset.symbol}
                <small>{money(balance * quote.price)}</small>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
