"use client";

import { Panel, PanelHeader } from "@/components/ui";
import { money } from "@/lib/format";
import { usePortfolioValuation } from "../valuation";
import styles from "./portfolio.module.css";

export function AllocationPanel() {
  const { total, cash, stocks, crypto, plans, reserved, pendingCash } = usePortfolioValuation();
  const parts = [
    { label: "Available cash", value: cash, color: "#d9ced3" },
    { label: "Pending withdrawals", value: pendingCash, color: "#96908e" },
    { label: "Stocks", value: stocks, color: "#d51e32" },
    { label: "Crypto", value: crypto, color: "#f08a52" },
    { label: "Automated plans", value: plans, color: "#7a3a4a" },
    { label: "Reservation deposits", value: reserved, color: "#16704d" },
  ];
  return (
    <Panel aria-labelledby="allocation-heading">
      <PanelHeader title={<span id="allocation-heading">Allocation</span>} />
      <div className={styles.allocation} role="img" aria-label="Share of account value by category">
        {parts.map(part => part.value > 0 && <span key={part.label} style={{ width: `${(part.value / total) * 100}%`, background: part.color }} />)}
      </div>
      <div className={styles.legend}>
        {parts.map(part => (
          <div key={part.label}>
            <i style={{ background: part.color }} aria-hidden="true" />
            <span>{part.label}</span>
            <b>{money(part.value)}</b>
          </div>
        ))}
      </div>
    </Panel>
  );
}
