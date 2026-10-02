import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { HoldingsPanel } from "@/features/portfolio";
import { MarketTerminal, stocks } from "@/features/market";
import { NewsList } from "@/features/news";
import { StockBrowser } from "@/features/stocks";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Stocks" };

export default function StocksPage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Stocks · Realtime" title="Quotes, news, and watchlists." aside={<Tag>Live prices</Tag>} />
      <p className={styles.intro}>Prices update every few seconds. Star a company to add it to your watchlist, or open a quote to trade with funds.</p>
      <MarketTerminal instruments={stocks} label="Choose a stock" />
      <div className={styles.section}>
        <StockBrowser />
      </div>
      <div className={`${styles.splitEven} ${styles.section}`}>
        <HoldingsPanel />
        <NewsList topic="stocks" title="Stock market news" />
      </div>
    </>
  );
}
