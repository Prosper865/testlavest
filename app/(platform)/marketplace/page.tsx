import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { MarketplaceWorkspace, ReservationsPanel } from "@/features/marketplace";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Tesla marketplace" };

export default function MarketplacePage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Marketplace · Tesla" title="A curated EV selection." aside={<Tag>Illustrative listings</Tag>} />
      <p className={styles.intro}>New and inspected pre-owned Tesla vehicles, hand-picked. Reserve one with a refundable deposit, or save toward it automatically.</p>
      <MarketplaceWorkspace />
      <div className={styles.section}>
        <ReservationsPanel />
      </div>
    </>
  );
}
