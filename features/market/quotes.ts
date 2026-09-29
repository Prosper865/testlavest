"use client";

// Simulated real-time quotes. A small random walk ticks while any component is subscribed.
// Swap `tick` for a websocket or polling feed from a licensed provider to go live.

import { useSyncExternalStore } from "react";
import { instruments, type Instrument } from "./instruments";

export type Quote = { symbol: string; price: number; previousClose: number; change: number; updatedAt: number };
type Quotes = Record<string, Quote>;

const TICK_MS = 3000;
const volatility: Record<Instrument["kind"], number> = { stock: 0.0018, crypto: 0.003, forex: 0.0003 };

const initialQuotes: Quotes = Object.fromEntries(
  instruments.map(item => [item.symbol, { symbol: item.symbol, price: item.price, previousClose: item.price / (1 + item.change / 100), change: item.change, updatedAt: 0 }]),
);

let quotes = initialQuotes;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  const now = Date.now();
  quotes = Object.fromEntries(
    instruments.map(item => {
      const current = quotes[item.symbol];
      const price = current.price * (1 + (Math.random() - 0.5) * 2 * volatility[item.kind]);
      return [item.symbol, { ...current, price, change: (price / current.previousClose - 1) * 100, updatedAt: now }];
    }),
  );
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) timer = setInterval(tick, TICK_MS);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function getQuotes() {
  return quotes;
}

export function useQuotes() {
  return useSyncExternalStore(subscribe, () => quotes, () => initialQuotes);
}

export function useQuote(symbol: string) {
  return useQuotes()[symbol];
}
