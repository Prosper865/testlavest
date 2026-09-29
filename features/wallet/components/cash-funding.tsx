"use client";

import { useState } from "react";
import { Button, Panel, PanelHeader, StatusMessage } from "@/components/ui";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { money } from "@/lib/format";
import styles from "./wallet.module.css";

const amounts = [1000, 5000, 10000];

export function CashFunding() {
  const { cash } = usePortfolio();
  const [notice, setNotice] = useState("");
  return (
    <Panel aria-labelledby="cash-heading">
      <PanelHeader title={<span id="cash-heading">Cash balance</span>} />
      <div className={styles.total}>{money(cash)}</div>
      <p className="muted">Top up virtual USD to try trading, automated plans, and marketplace reservations.</p>
      <div className={styles.cash}>
        {amounts.map(amount => (
          <Button key={amount} variant="outline" size="sm" onClick={() => setNotice(portfolioActions.addCash(amount).message)}>+ {money(amount)}</Button>
        ))}
      </div>
      <StatusMessage>{notice}</StatusMessage>
    </Panel>
  );
}
