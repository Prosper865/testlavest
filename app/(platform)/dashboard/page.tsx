import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { CryptoHoldings } from "@/features/crypto";
import { MarketNews } from "@/features/news";
import { ActivityFeed, AllocationPanel, HoldingsPanel, ModuleShortcuts, PortfolioOverview } from "@/features/portfolio";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Your investment workspace" title="A clearer view of your wealth." aside={<Tag>Demo account · USD</Tag>} />
      <p className={styles.intro}>Practice with simulated prices and virtual funds across investments, stocks, crypto, and the marketplace.</p>
      <ModuleShortcuts />
      <div className={`${styles.split} ${styles.section}`}>
        <PortfolioOverview />
        <div className={styles.stack}>
          <AllocationPanel />
          <ActivityFeed limit={6} />
        </div>
      </div>
      <div className={`${styles.splitEven} ${styles.section}`}>
        <HoldingsPanel />
        <CryptoHoldings />
      </div>
      <div className={styles.section}>
        <MarketNews />
      </div>
    </>
  );
}
