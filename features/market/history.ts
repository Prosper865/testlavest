// Simulated OHLCV price history. Deterministic per symbol and timeframe, and ends at the
// instrument's reference price so charts line up with the live quote. Replace with a
// licensed historical-bars endpoint to show real data.

import { getInstrument, type InstrumentKind } from "./instruments";

export const timeframes = ["1D", "1W", "1M", "3M", "1Y", "5Y"] as const;
export type Timeframe = (typeof timeframes)[number];

export type Candle = { open: number; high: number; low: number; close: number; volume: number };

type Spec = { bars: number; intervalMin: number; intraday: boolean };
const MINUTE = 60_000;
const DAY_MIN = 1440;

const specs: Record<Timeframe, Spec> = {
  "1D": { bars: 78, intervalMin: 5, intraday: true },
  "1W": { bars: 65, intervalMin: 30, intraday: true },
  "1M": { bars: 22, intervalMin: DAY_MIN, intraday: false },
  "3M": { bars: 63, intervalMin: DAY_MIN, intraday: false },
  "1Y": { bars: 252, intervalMin: DAY_MIN, intraday: false },
  "5Y": { bars: 260, intervalMin: DAY_MIN * 7, intraday: false },
};

const dailyVolatility: Record<InstrumentKind, number> = { stock: 0.019, crypto: 0.034, forex: 0.005 };
const dailyVolume: Record<string, number> = { TSLA: 95e6, AAPL: 55e6, NVDA: 240e6, MSFT: 21e6, AMZN: 42e6, JPM: 9e6, V: 7e6, BTC: 32e3, ETH: 410e3, SOL: 3.1e6, XRP: 2.4e9, ADA: 1.1e9, DOGE: 6.5e9 };

function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sample via Box-Muller. */
function normal(random: () => number) {
  return Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());
}

export function generateCandles(symbol: string, timeframe: Timeframe): Candle[] {
  const item = getInstrument(symbol);
  if (!item) return [];
  const spec = specs[timeframe];
  const random = seeded(`${symbol}:${timeframe}`);
  // Intraday sessions are 6.5 trading hours for stocks and 24 hours otherwise.
  const barsPerDay = spec.intraday ? (item.kind === "stock" ? 390 : DAY_MIN) / spec.intervalMin : DAY_MIN / spec.intervalMin;
  const sigma = dailyVolatility[item.kind] / Math.sqrt(barsPerDay);
  const drift = (item.kind === "forex" ? 0 : 0.0004) / barsPerDay;
  const baseVolume = (dailyVolume[symbol] ?? 1e6) / barsPerDay;

  const raw: Candle[] = [];
  let price = 100;
  let momentum = 0;
  for (let i = 0; i < spec.bars; i++) {
    momentum = momentum * 0.85 + normal(random) * 0.35;
    const change = drift + sigma * (normal(random) * 0.9 + momentum * 0.4);
    const open = price;
    const close = open * Math.exp(change);
    const wick = sigma * 0.6;
    const high = Math.max(open, close) * (1 + Math.abs(normal(random)) * wick);
    const low = Math.min(open, close) * (1 - Math.abs(normal(random)) * wick);
    // Intraday volume is U-shaped: heavier near the open and close.
    const session = spec.intraday ? (i % barsPerDay) / barsPerDay : 0.5;
    const shape = spec.intraday ? 0.6 + 1.6 * (session - 0.5) ** 2 * 4 : 1;
    const volume = baseVolume * shape * (0.6 + random() * 0.8) * (1 + Math.abs(change) / sigma * 0.35);
    raw.push({ open, high, low, close, volume });
    price = close;
  }

  // Rescale so the last close equals the reference price. For 1D, also tilt the path so the
  // session opens at the previous close and the day's change matches the quote.
  const scale = item.price / price;
  const previousClose = item.price / (1 + item.change / 100);
  const tilt = timeframe === "1D" ? previousClose / (raw[0].open * scale) : 1;
  return raw.map((c, i) => {
    const factor = scale * tilt ** (1 - i / (raw.length - 1));
    return { open: c.open * factor, high: c.high * factor, low: c.low * factor, close: c.close * factor, volume: Math.round(c.volume) };
  });
}

const isWeekend = (date: Date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
// US regular session in UTC (9:30–16:00 ET, daylight time).
const inSession = (date: Date) => {
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return minutes >= 13 * 60 + 30 && minutes < 20 * 60;
};

/** Bar open times in seconds (chart time), ending at `now`. Stocks skip weekends and closed hours. */
export function barTimes(symbol: string, timeframe: Timeframe, count: number, now: number): number[] {
  const kind = getInstrument(symbol)?.kind ?? "stock";
  const { intervalMin, intraday } = specs[timeframe];
  const step = intervalMin * MINUTE;
  const times: number[] = [];
  let t = intraday ? Math.floor(now / step) * step : Math.floor(now / (DAY_MIN * MINUTE)) * DAY_MIN * MINUTE;
  for (let guard = 0; times.length < count && guard < 100_000; guard++, t -= step) {
    const date = new Date(t);
    const weekly = intervalMin > DAY_MIN;
    if (kind === "stock" && !weekly && (isWeekend(date) || (intraday && !inSession(date)))) continue;
    times.unshift(t);
  }
  // The chart library renders times as UTC; shift so the axis reads in the viewer's local time.
  const offset = new Date(now).getTimezoneOffset() * MINUTE;
  return times.map(time => Math.floor((time - offset) / 1000));
}

export function isIntraday(timeframe: Timeframe) {
  return specs[timeframe].intraday;
}
