"use client";

import { ButtonLink, Panel, PanelHeader } from "@/components/ui";
import { useAccount } from "@/features/account";
import { money } from "@/lib/format";
import styles from "./wallet.module.css";

export function CashFunding() {
  const { planPayments } = useAccount();
  return (
    <Panel aria-labelledby="cash-heading">
      <PanelHeader title={<span id="cash-heading">Plan balance</span>} />
      <div className={styles.total}>{money(planPayments.balanceAmount)}</div>
      <p className="muted">Choose a receiving wallet and submit a payment screenshot. Your balance updates after admin approval.</p>
      <div className={styles.cash}>
        <ButtonLink href="/deposits">Deposit with a wallet</ButtonLink>
        <ButtonLink href="/withdrawals" variant="outline">Withdraw</ButtonLink>
      </div>
    </Panel>
  );
}
