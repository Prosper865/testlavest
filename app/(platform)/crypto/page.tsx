import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { CryptoHoldings } from "@/features/crypto";
import { PlanList } from "@/features/investments";
import { MarketTerminal, cryptoAssets } from "@/features/market";
import { NewsList } from "@/features/news";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Crypto" };

export default function CryptoPage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Crypto · 24/7" title="Invest in digital assets." aside={<Tag>Simulated live prices</Tag>} />
      <p className={styles.intro}>Buy and sell Bitcoin, Ethereum, and more in any amount from $1, around the clock. Set up recurring buys to invest a fixed amount on a schedule.</p>
      <MarketTerminal instruments={cryptoAssets} label="Choose a coin" />
      <div className={`${styles.splitEven} ${styles.section}`}>
        <div className={styles.stack}>
          <CryptoHoldings />
          <PlanList title="Recurring crypto buys" filter="crypto" emptyText="No recurring buys yet. Open a coin to set one up." />
        </div>
        <NewsList topic="crypto" title="Crypto news" />
      </div>
    </>
  );
}
