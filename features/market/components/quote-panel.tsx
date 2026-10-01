"use client";

import { Button, Panel, Stat, Tag } from "@/components/ui";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { formatAmount, formatPrice, formatShares, money } from "@/lib/format";
import { getInstrument } from "../instruments";
import { useQuote } from "../quotes";
import { MarketLogo } from "./market-logo";
import { PriceChange } from "./price-change";
import { PriceChart } from "./price-chart";
import styles from "./quote-panel.module.css";
import { Icon } from "@/components/ui";

/** Quote header, trading chart, and position summary for a stock or a coin. */
export function QuotePanel({ symbol }: { symbol: string }) {
  const item = getInstrument(symbol)!;
  const quote = useQuote(symbol);
  const { holdings, crypto, watchlist } = usePortfolio();
  const isCrypto = item.kind === "crypto";
  const held = (isCrypto ? crypto[symbol] : holdings[symbol]) ?? 0;
  const watched = watchlist.includes(symbol);

  return (
    <Panel aria-label={`${item.name} quote`}>
      <div className={styles.head}>
        <MarketLogo symbol={symbol} />
        <div>
          <h1>{item.name}</h1>
          <p>{symbol} · {isCrypto ? "Cryptocurrency · trades 24/7" : item.sector} · USD</p>
        </div>
        <Button variant="outline" size="sm" className={styles.watch} aria-pressed={watched} onClick={() => portfolioActions.toggleWatch(symbol)}>
          {watched ? <><Icon name="star" filled /> Watching</> : <><Icon name="star" /> Add to watchlist</>}
        </Button>
      </div>
      <div className={styles.price}>
        <b>{formatPrice(quote.price, item.decimals)}</b>
        <PriceChange value={quote.change} arrow />
        <Tag>Simulated live</Tag>
      </div>
      <PriceChart symbol={symbol} height={440} />
      {item.about && <p className={styles.about}>{item.about}</p>}
      <div className={styles.stats}>
        <Stat label={isCrypto ? `Your ${symbol}` : "Your shares"} value={isCrypto ? formatAmount(held, 8) : formatShares(held)} />
        <Stat label="Position value" value={money(held * quote.price)} />
        <Stat label={isCrypto ? "24h open" : "Previous close"} value={formatPrice(quote.previousClose, item.decimals)} />
      </div>
    </Panel>
  );
}
