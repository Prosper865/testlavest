"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { usePortfolioValuation } from "../valuation";
import styles from "./portfolio.module.css";

export function ModuleShortcuts() {
  const { portfolio, stocks, crypto, plans } = usePortfolioValuation();
  const activePlans = portfolio.plans.filter(plan => plan.status === "active").length;
  const items = [
    { href: "/investments", label: "Automated", title: "Investments", value: money(plans), note: `${activePlans} active plan${activePlans === 1 ? "" : "s"}` },
    { href: "/stocks", label: "Realtime", title: "Stocks", value: money(stocks), note: `${portfolio.watchlist.length} on watchlist` },
    { href: "/crypto", label: "24/7", title: "Crypto", value: money(crypto), note: "Live rates" },
    { href: "/wallet", label: "Transfers", title: "Wallet", value: money(portfolio.cash), note: "Cash, deposits, withdrawals" },
    { href: "/marketplace", label: "Tesla", title: "Marketplace", value: "Shop", note: "Buy a Tesla online" },
  ];
  return (
    <nav className={styles.shortcuts} aria-label="Platform modules">
      {items.map(item => (
        <Link key={item.href} href={item.href} className={styles.shortcut}>
          <span>{item.label}</span>
          <b>{item.title}</b>
          <strong>{item.value}</strong>
          <small>{item.note}</small>
        </Link>
      ))}
    </nav>
  );
}
