"use client";

import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import { barTimes, generateCandles, type Timeframe } from "@/features/market/history";
import { useQuote } from "@/features/market/quotes";
import { money, percent } from "@/lib/format";
import styles from "./market-snapshot-chart.module.css";

export type ChartRange = "1M" | "6M" | "1Y" | "ALL";
const ranges: ChartRange[] = ["1M", "6M", "1Y", "ALL"];
const symbol = "TSLA";

function historyFor(range: ChartRange) {
  const timeframe: Timeframe = range === "1M" ? "1M" : range === "ALL" ? "5Y" : "1Y";
  const history = generateCandles(symbol, timeframe);
  return { timeframe, candles: range === "6M" ? history.slice(-126) : history };
}

export function MarketSnapshotChart({ onTrade }: { onTrade: () => void }) {
  const [range, setRange] = useState<ChartRange>("1M");
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const quote = useQuote(symbol);
  const history = useMemo(() => historyFor(range), [range]);
  const firstPrice = history.candles[0]?.open ?? quote.price;
  const displayedPrice = hoveredPrice ?? quote.price;
  const change = firstPrice > 0 ? (displayedPrice / firstPrice - 1) * 100 : 0;
  const periodChange = firstPrice > 0 ? (quote.price / firstPrice - 1) * 100 : 0;
  const up = periodChange >= 0;
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<"Area"> | null>(null);
  const lastTime = useRef<UTCTimestamp | null>(null);

  useEffect(() => {
    if (!container.current) return;
    const api = createChart(container.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "#ffffff" }, textColor: "#8a8b93", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 10 },
      grid: { vertLines: { color: "#f4f2f4" }, horzLines: { color: "#f0eef1" } },
      rightPriceScale: { borderVisible: false, minimumWidth: 49 },
      timeScale: { borderVisible: false, rightOffset: 1, minBarSpacing: 1 },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: "#aeb0b7", labelVisible: false }, horzLine: { color: "#aeb0b7", labelBackgroundColor: "#282a31" } },
      localization: { priceFormatter: (value: number) => `$${value.toFixed(2)}` },
      handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false, axisDoubleClickReset: false },
    });
    const area = api.addSeries(AreaSeries, { lineColor: "#cf2540", lineWidth: 2, topColor: "rgba(207, 37, 64, .20)", bottomColor: "rgba(207, 37, 64, 0)", priceLineVisible: false, lastValueVisible: true });
    let fitFrame = 0;
    const fit = () => {
      cancelAnimationFrame(fitFrame);
      fitFrame = requestAnimationFrame(() => api.timeScale().fitContent());
    };
    const observer = new ResizeObserver(fit);
    observer.observe(container.current);
    const onMove = (param: MouseEventParams) => {
      const point = param.seriesData.get(area);
      setHoveredPrice(point && typeof point === "object" && "value" in point && typeof point.value === "number" ? point.value : null);
    };
    api.subscribeCrosshairMove(onMove);
    chart.current = api;
    series.current = area;
    return () => {
      observer.disconnect();
      cancelAnimationFrame(fitFrame);
      api.unsubscribeCrosshairMove(onMove);
      api.remove();
      chart.current = null;
      series.current = null;
      lastTime.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chart.current || !series.current) return;
    const times = barTimes(symbol, history.timeframe, history.candles.length, Date.now()) as UTCTimestamp[];
    lastTime.current = times.at(-1) ?? null;
    series.current.setData(history.candles.map((candle, index) => ({ time: times[index], value: candle.close })));
    chart.current.timeScale().fitContent();
  }, [history]);

  useEffect(() => {
    if (lastTime.current !== null) series.current?.update({ time: lastTime.current, value: quote.price });
  }, [quote.price, history]);

  useEffect(() => {
    series.current?.applyOptions(up
      ? { lineColor: "#16855f", topColor: "rgba(22, 133, 95, .18)", bottomColor: "rgba(22, 133, 95, 0)" }
      : { lineColor: "#cf2540", topColor: "rgba(207, 37, 64, .20)", bottomColor: "rgba(207, 37, 64, 0)" });
  }, [up]);

  return <div className={styles.snapshot}>
    <div className={styles.heading}><div className={styles.asset}><span className={styles.logo}>T</span><div><strong>Tesla</strong><small>TSLA · SIMULATED</small></div></div><button type="button" onClick={onTrade}>Trade →</button></div>
    <div className={styles.readout}><strong>{money(displayedPrice)}</strong><span className={change >= 0 ? styles.up : styles.down}>{percent(change)} <small>{hoveredPrice === null ? range : "at cursor"}</small></span></div>
    <div ref={container} className={styles.canvas} role="img" aria-label={`Tesla simulated price chart, ${range}, ${percent(periodChange)}. Touch or hover to inspect prices.`} onPointerLeave={() => setHoveredPrice(null)} />
    <div className={styles.ranges} role="group" aria-label="Chart period">{ranges.map(value => <button key={value} type="button" aria-pressed={range === value} className={range === value ? styles.selected : ""} onClick={() => { setRange(value); setHoveredPrice(null); }}>{value}</button>)}</div>
    <p className={styles.note}>Simulated price history · not real market data</p>
  </div>;
}
