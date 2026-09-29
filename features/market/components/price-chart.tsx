"use client";

import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui";
import { barTimes, generateCandles, isIntraday, timeframes, type Candle, type Timeframe } from "../history";
import { getInstrument } from "../instruments";
import { useQuote } from "../quotes";
import { formatPrice, percent } from "@/lib/format";
import styles from "./price-chart.module.css";

type ChartType = "candles" | "line";

// Up and down colours validated for colour-vision deficiency; up candles are hollow
// so direction never depends on colour alone.
const UP = "#0f8a5f";
const DOWN = "#d51e32";
const INK = "#6a6870";
const GRID = "#f2eef0";

const periodLabel: Record<Timeframe, string> = { "1D": "today", "1W": "past week", "1M": "past month", "3M": "past 3 months", "1Y": "past year", "5Y": "past 5 years" };
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** Candle list with the final bar following the live simulated price. */
function useLiveCandles(symbol: string, timeframe: Timeframe) {
  const history = useMemo(() => generateCandles(symbol, timeframe), [symbol, timeframe]);
  const price = useQuote(symbol).price;
  return useMemo(() => {
    const last = history[history.length - 1];
    if (!last) return history;
    return [...history.slice(0, -1), { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price) }];
  }, [history, price]);
}

export function PriceChart({ symbol, height = 420, defaultTimeframe = "3M" }: { symbol: string; height?: number; defaultTimeframe?: Timeframe }) {
  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe);
  const [type, setType] = useState<ChartType>("candles");
  const [hovered, setHovered] = useState<number | null>(null);
  const candles = useLiveCandles(symbol, timeframe);
  const decimals = getInstrument(symbol)?.decimals ?? 2;

  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const priceSeries = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null>(null);
  const volumeSeries = useRef<ISeriesApi<"Histogram"> | null>(null);
  const times = useRef<UTCTimestamp[]>([]);
  const candlesRef = useRef(candles);

  // Effects run in order: keep the ref current before the data effects below read it.
  useEffect(() => {
    candlesRef.current = candles;
  });

  // Create the chart and its series; rebuilt when the chart type changes.
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const api = createChart(element, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: INK,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 11,
        panes: { separatorColor: "#e6e3e5", separatorHoverColor: "#fdecef" },
      },
      grid: { vertLines: { color: GRID }, horzLines: { color: GRID } },
      rightPriceScale: { borderColor: "#e6e3e5" },
      timeScale: { borderColor: "#e6e3e5", rightOffset: 4 },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: "#b9aeb4", labelBackgroundColor: "#202126" }, horzLine: { color: "#b9aeb4", labelBackgroundColor: "#202126" } },
      localization: { priceFormatter: (value: number) => value.toFixed(decimals) },
      // Keep the mouse wheel for page scrolling; drag pans and pinch zooms.
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
    });
    priceSeries.current = type === "candles"
      ? api.addSeries(CandlestickSeries, { upColor: "#ffffff", downColor: DOWN, borderUpColor: UP, borderDownColor: DOWN, wickUpColor: UP, wickDownColor: DOWN, priceLineColor: "#202126" })
      : api.addSeries(AreaSeries, { lineColor: DOWN, lineWidth: 2, topColor: "rgba(213, 30, 50, 0.16)", bottomColor: "rgba(213, 30, 50, 0)", priceLineColor: "#202126" });
    // Volume sits in its own pane rather than on a second axis over the price.
    volumeSeries.current = api.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceLineVisible: false, lastValueVisible: false }, 1);
    api.panes()[1]?.setStretchFactor(0.22);

    const onMove = (param: MouseEventParams) => {
      const index = param.time === undefined ? -1 : times.current.indexOf(param.time as UTCTimestamp);
      setHovered(index >= 0 ? index : null);
    };
    api.subscribeCrosshairMove(onMove);
    chart.current = api;
    return () => {
      api.unsubscribeCrosshairMove(onMove);
      api.remove();
      chart.current = null;
      priceSeries.current = null;
      volumeSeries.current = null;
    };
  }, [type, decimals]);

  // Load the full history when the symbol, timeframe, or chart type changes.
  useEffect(() => {
    const api = chart.current;
    const data = candlesRef.current;
    if (!api || !priceSeries.current || !volumeSeries.current) return;
    times.current = barTimes(symbol, timeframe, data.length, Date.now()) as UTCTimestamp[];
    api.applyOptions({ timeScale: { timeVisible: isIntraday(timeframe), secondsVisible: false } });
    if (type === "candles") {
      (priceSeries.current as ISeriesApi<"Candlestick">).setData(data.map((c, i) => ({ time: times.current[i], open: c.open, high: c.high, low: c.low, close: c.close })));
    } else {
      (priceSeries.current as ISeriesApi<"Area">).setData(data.map((c, i) => ({ time: times.current[i], value: c.close })));
    }
    volumeSeries.current.setData(data.map((c, i) => ({ time: times.current[i], value: c.volume, color: c.close >= c.open ? "rgba(15, 138, 95, 0.45)" : "rgba(213, 30, 50, 0.45)" })));
    api.timeScale().fitContent();
  }, [symbol, timeframe, type]);

  // Stream the live price into the last bar.
  useEffect(() => {
    const last = candles[candles.length - 1];
    const time = times.current[candles.length - 1];
    if (!last || time === undefined || !priceSeries.current) return;
    if (type === "candles") (priceSeries.current as ISeriesApi<"Candlestick">).update({ time, open: last.open, high: last.high, low: last.low, close: last.close });
    else (priceSeries.current as ISeriesApi<"Area">).update({ time, value: last.close });
  }, [candles, type]);

  const shown: Candle | undefined = candles[hovered ?? candles.length - 1];
  const first = candles[0];
  const last = candles[candles.length - 1];
  const periodChange = first && last ? (last.close / first.open - 1) * 100 : 0;
  const fmt = (value: number) => formatPrice(value, decimals, false);

  return (
    <div className={styles.chart}>
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          <SegmentedControl label="Chart timeframe" options={timeframes} value={timeframe} onChange={value => { setTimeframe(value); setHovered(null); }} />
          <div className={styles.types} role="group" aria-label="Chart type">
            <button type="button" aria-pressed={type === "candles"} onClick={() => setType("candles")}>Candles</button>
            <button type="button" aria-pressed={type === "line"} onClick={() => setType("line")}>Line</button>
          </div>
        </div>
        <p className={styles.period}>
          <span className={periodChange >= 0 ? "positive" : "negative"}>{percent(periodChange)}</span>
          {periodLabel[timeframe]}
        </p>
      </div>
      <div className={styles.readout} aria-live="off">
        {shown && (
          <>
            <span>O<b>{fmt(shown.open)}</b></span>
            <span>H<b>{fmt(shown.high)}</b></span>
            <span>L<b>{fmt(shown.low)}</b></span>
            <span>C<b className={shown.close >= shown.open ? "positive" : "negative"}>{fmt(shown.close)}</b></span>
            <span>Vol<b>{compact.format(shown.volume)}</b></span>
          </>
        )}
      </div>
      <div
        ref={container}
        className={styles.canvas}
        style={{ "--chart-height": `${height}px` } as React.CSSProperties}
        role="img"
        aria-label={`${symbol} ${type === "candles" ? "candlestick" : "line"} chart, ${periodLabel[timeframe]}, ${percent(periodChange)}. Simulated data.`}
      />
      <p className={styles.note}>Simulated price history for demonstration · not real market data</p>
    </div>
  );
}
