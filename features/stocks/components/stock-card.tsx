"use client";

import Link from "next/link";
import { MarketLogo } from "@/features/market/components/market-logo";
import { MiniChart } from "@/features/market/components/mini-chart";
import { PriceChange } from "@/features/market/components/price-change";
import type { Instrument } from "@/features/market/instruments";
import type { Quote } from "@/features/market/quotes";
import { formatPrice } from "@/lib/format";
import styles from "./stocks.module.css";
import { Icon } from "@/components/ui";

type Props = { stock: Instrument; quote: Quote; watched: boolean; onToggleWatch: () => void };

export function StockCard({ stock, quote, watched, onToggleWatch }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <MarketLogo symbol={stock.symbol} />
        <button
          type="button"
          className={styles.watch}
          aria-label={`${watched ? "Remove" : "Add"} ${stock.symbol} ${watched ? "from" : "to"} watchlist`}
          aria-pressed={watched}
          onClick={onToggleWatch}
        >
          <Icon name="star" filled={watched} />
        </button>
      </div>
      <h3>{stock.name}</h3>
      <p className="muted">{stock.symbol} <span>· {stock.sector}</span></p>
      <div className={styles.price}>
        <b>{formatPrice(quote.price)}</b>
        <PriceChange value={quote.change} />
      </div>
      <MiniChart symbol={stock.symbol} className={styles.mini} />
      <Link className={styles.action} href={`/stocks/${stock.symbol}`}>
        View quote &amp; trade <span aria-hidden="true"><Icon name="arrow-up-right" /></span>
      </Link>
    </article>
  );
}
