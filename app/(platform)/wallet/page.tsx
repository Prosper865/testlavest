import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading, Tag } from "@/components/ui";
import { ActivityFeed } from "@/features/portfolio";
import { CashFunding, TransferForm, WalletBalances } from "@/features/wallet";
import styles from "../platform.module.css";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Crypto wallet" };

export default function WalletPage() {
  return (
    <>
      <SectionHeading level="h1" eyebrow="Wallet · Crypto" title="Deposit and withdraw easily." aside={<Tag>Transfers</Tag>} />
      <p className={styles.intro}>Track your Bitcoin, Ethereum, and Solana balances at live prices, and manage your cash balance for the rest of the platform.</p>
      <p className={styles.intro}><Link href="/withdrawals">Withdraw funds to a bank / view withdrawal status <Icon name="arrow-right" /></Link></p>
      <div className={styles.split}>
        <div className={styles.stack}>
          <WalletBalances />
          <ActivityFeed title="Wallet activity" modules={["wallet", "account"]} />
        </div>d
        <div className={styles.stack}>
          <TransferForm />
          <CashFunding />
        </div>
      </div>
    </>
  );
}
