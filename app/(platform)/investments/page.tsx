import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { StrategyPicker } from "@/features/investments";
import { ActivityFeed } from "@/features/portfolio";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Automated investments" };

export default function InvestmentsPage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Investments · Automated" title="Flexible plans, recurring contributions." aside={<Tag>Concept portfolios</Tag>} />
      <p className={styles.intro}>Pick a strategy, choose how much and how often, and contributions run automatically from your cash balance. Pause, top up, or close a plan at any time.</p>
      <StrategyPicker />
      <div className={styles.section}>
        <ActivityFeed title="Plan activity" modules={["investments"]} />
      </div>
    </>
  );
}
