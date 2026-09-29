import { useId } from "react";
import { cn } from "@/lib/utils";
import styles from "./charts.module.css";

export const chartRanges = ["1M", "6M", "1Y", "ALL"] as const;
export type ChartRange = (typeof chartRanges)[number];

// Fixed illustrative shapes, not real performance history.
const paths: Record<ChartRange, string> = {
  "1M": "0,140 25,132 45,145 70,115 100,125 130,98 160,112 190,76 220,95 250,55 280,72 320,35 350,45 390,22 430,34 470,12 520,20",
  "6M": "0,155 30,135 55,143 80,128 110,146 140,98 170,114 200,94 230,120 265,78 295,93 325,49 350,64 390,43 430,59 470,24 520,20",
  "1Y": "0,167 25,165 45,148 60,156 80,128 95,143 115,135 140,158 165,119 185,126 205,103 225,116 240,86 260,97 280,74 300,89 320,63 340,70 360,44 375,58 395,39 415,48 438,24 455,34 480,13 500,24 520,10",
  ALL: "0,175 40,157 80,168 120,129 160,143 200,103 240,133 280,87 320,98 360,55 400,65 440,35 480,44 520,10",
};

export function LineChart({ range = "1Y", className }: { range?: ChartRange; className?: string }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg className={cn(styles.chart, className)} viewBox="0 0 520 200" role="img" aria-label={`Illustrative ${range} performance chart; sample data, not actual returns`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 80, 130, 180].map(y => <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="currentColor" opacity=".08" />)}
      <polygon points={`0,200 ${paths[range]} 520,200`} fill={`url(#${id})`} />
      <polyline points={paths[range]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
