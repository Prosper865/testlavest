import { instruments } from "./instruments";

/** Shared, bounded demo quotes: browsers estimate; the server determines the fill. */
export function simulationQuotes(now = Date.now()) {
  const tick = Math.floor(now / 3000);
  return Object.fromEntries(instruments.map((item, index) => {
    const price = item.price * (1 + Math.sin(tick / 30 + index) * 0.003);
    const previousClose = item.price / (1 + item.change / 100);
    return [item.symbol, { symbol: item.symbol, price, previousClose, change: (price / previousClose - 1) * 100, updatedAt: now }];
  }));
}
