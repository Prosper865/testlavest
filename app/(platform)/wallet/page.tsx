import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { ActivityFeed } from "@/features/portfolio";
import { CashFunding, TransferForm, WalletBalances } from "@/features/wallet";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Crypto wallet" };

export default function WalletPage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Wallet · Crypto" title="Deposit and withdraw easily." aside={<Tag>Simulated transfers</Tag>} />
      <p className={styles.intro}>Track your Bitcoin, Ethereum, and Solana balances at simulated live prices, and manage your cash balance for the rest of the platform.</p>
      <div className={styles.split}>
        <div className={styles.stack}>
          <WalletBalances />
          <ActivityFeed title="Wallet activity" modules={["wallet", "account"]} />
        </div>
        <div className={styles.stack}>
          <TransferForm />
          <CashFunding />
        </div>
      </div>
    </>
  );
}
