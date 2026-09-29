"use client";

import { useState } from "react";
import { LineChart, chartRanges, type ChartRange } from "@/components/charts/line-chart";
import { Panel, SegmentedControl, Stat, Tag } from "@/components/ui";
import { money } from "@/lib/format";
import { usePortfolioValuation } from "../valuation";
import styles from "./portfolio.module.css";

export function PortfolioOverview() {
  const [range, setRange] = useState<ChartRange>("1Y");
  const { total, cash, stocks, crypto, plans } = usePortfolioValuation();
  return (
    <Panel aria-label="Portfolio overview">
      <div className={styles.overviewTop}>
        <span>Total account value</span>
        <Tag>Simulated live</Tag>
      </div>
      <div className={styles.value}>{money(total)}</div>
      <SegmentedControl label="Chart period" options={chartRanges} value={range} onChange={setRange} className={styles.ranges} />
      <LineChart range={range} />
      <div className={styles.balances}>
        <Stat label="Buying power" value={money(cash)} />
        <Stat label="Stocks" value={money(stocks)} />
        <Stat label="Crypto" value={money(crypto)} />
        <Stat label="Automated plans" value={money(plans)} />
      </div>
    </Panel>
  );
}
