const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function money(value: number) {
  return usd.format(value);
}

/** Price with a fixed number of decimals; forex pairs are shown without a currency sign. */
export function formatPrice(value: number, decimals = 2, currency = true) {
  const text = value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return currency ? `$${text}` : text;
}

export function percent(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export function formatAmount(value: number, maxDecimals = 6) {
  return value.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}

/** Share counts: whole numbers stay whole, fractional shares show up to 4 decimals. */
export function formatShares(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function formatDate(timestamp: number) {
  return dateFormat.format(timestamp);
}

export function formatDateTime(timestamp: number) {
  return timeFormat.format(timestamp);
}

export function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}
