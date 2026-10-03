"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import { generateCandles, type Timeframe } from "../history";
import { useQuote } from "../quotes";
import styles from "./mini-chart.module.css";

const W = 300;
const H = 80;
const PAD = 4;

type Props = { symbol: string; timeframe?: Timeframe; className?: string; label?: string };

/** Compact area chart drawn from the instrument's own price history, ending at the live price. */
export function MiniChart({ symbol, timeframe = "1D", className, label }: Props) {
  const id = useId().replaceAll(":", "");
  const history = useMemo(() => generateCandles(symbol, timeframe), [symbol, timeframe]);
  const price = useQuote(symbol)?.price;

  const { line, area, baseline, up } = useMemo(() => {
    const closes = history.map(candle => candle.close);
    if (price !== undefined && closes.length) closes[closes.length - 1] = price;
    const open = history[0]?.open ?? closes[0] ?? 0;
    const min = Math.min(open, ...closes);
    const max = Math.max(open, ...closes);
    const range = max - min || 1;
    const x = (i: number) => (i / Math.max(1, closes.length - 1)) * W;
    const y = (value: number) => PAD + (1 - (value - min) / range) * (H - PAD * 2);
    const points = closes.map((value, i) => `${x(i).toFixed(1)},${y(value).toFixed(1)}`);
    return {
      line: `M${points.join(" L")}`,
      area: `M0,${H} L${points.join(" L")} L${W},${H} Z`,
      baseline: y(open),
      up: (closes[closes.length - 1] ?? 0) >= open,
    };
  }, [history, price]);

  return (
    <svg
      className={cn(styles.chart, up ? styles.up : styles.down, className)}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label ?? `${symbol} ${timeframe === "1D" ? "intraday" : timeframe} price trend, ${up ? "up" : "down"}.`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" x2={W} y1={baseline} y2={baseline} className={styles.baseline} />
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
