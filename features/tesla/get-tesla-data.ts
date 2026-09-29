import "server-only";

// Real Tesla company data from Finnhub: quote, profile, key metrics, and the earnings calendar.
// Every field is optional so the page degrades gracefully without a key or when a call fails.

import { finnhubGet } from "@/lib/finnhub";

type Quote = { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number };
type Profile = { name: string; exchange: string; ipo: string; marketCapitalization: number; shareOutstanding: number; weburl: string; finnhubIndustry: string };
type Metrics = { metric: Record<string, number | undefined> };
type EarningsCalendar = { earningsCalendar: { date: string; hour: string; quarter: number; year: number; epsEstimate: number | null; revenueEstimate: number | null }[] };

export type TeslaData = {
  live: boolean;
  quote?: { price: number; change: number; changePercent: number; previousClose: number; dayHigh: number; dayLow: number; asOf: number };
  profile?: { name: string; exchange: string; ipo: string; marketCap: number; sharesOutstanding: number; website: string; industry: string };
  metrics?: { high52: number; low52: number; pe?: number; beta?: number };
  earnings: { date: string; quarter: number; year: number; hour: string; epsEstimate: number | null; revenueEstimate: number | null }[];
};

async function safe<T>(request: Promise<T | null>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    console.error("Tesla data request failed.", error);
    return null;
  }
}

export async function getTeslaData(): Promise<TeslaData> {
  const today = new Date();
  const later = new Date(today.getTime() + 200 * 86_400_000);
  const day = (date: Date) => date.toISOString().slice(0, 10);

  const [quote, profile, metrics, calendar] = await Promise.all([
    safe(finnhubGet<Quote>("/quote", { symbol: "TSLA" }, 300)),
    safe(finnhubGet<Profile>("/stock/profile2", { symbol: "TSLA" }, 86_400)),
    safe(finnhubGet<Metrics>("/stock/metric", { symbol: "TSLA", metric: "all" }, 3600)),
    safe(finnhubGet<EarningsCalendar>("/calendar/earnings", { symbol: "TSLA", from: day(today), to: day(later) }, 3600)),
  ]);

  const metric = metrics?.metric ?? {};
  return {
    live: Boolean(quote || profile || metrics),
    quote: quote?.c ? { price: quote.c, change: quote.d, changePercent: quote.dp, previousClose: quote.pc, dayHigh: quote.h, dayLow: quote.l, asOf: quote.t * 1000 } : undefined,
    profile: profile?.name ? {
      name: profile.name, exchange: profile.exchange, ipo: profile.ipo, website: profile.weburl, industry: profile.finnhubIndustry,
      // Finnhub reports market cap and share count in millions.
      marketCap: profile.marketCapitalization * 1e6, sharesOutstanding: profile.shareOutstanding * 1e6,
    } : undefined,
    metrics: metric["52WeekHigh"] && metric["52WeekLow"] ? {
      high52: metric["52WeekHigh"]!, low52: metric["52WeekLow"]!,
      pe: metric.peTTM ?? metric.peBasicExclExtraTTM, beta: metric.beta,
    } : undefined,
    earnings: (calendar?.earningsCalendar ?? []).map(item => ({ date: item.date, quarter: item.quarter, year: item.year, hour: item.hour, epsEstimate: item.epsEstimate, revenueEstimate: item.revenueEstimate })),
  };
}
