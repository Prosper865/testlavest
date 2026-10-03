import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { CryptoHoldings } from "@/features/crypto";
import { MarketTerminal, cryptoAssets } from "@/features/market";
import { NewsList } from "@/features/news";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Crypto" };

export default function CryptoPage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Crypto · 24/7" title="Invest in digital assets." aside={<Tag>Rates only</Tag>} />
      <p className={styles.intro}>Live crypto rates are shown for reference. Only Tesla and SpaceX are open for trading right now. If you already hold coins, you can still sell them below.</p>
      <MarketTerminal instruments={cryptoAssets} label="Choose a coin" />
      <div className={`${styles.splitEven} ${styles.section}`}>
        <div className={styles.stack}>
          <CryptoHoldings />
        </div>
        <NewsList topic="crypto" title="Crypto news" />
      </div>
    </>
  );
}
