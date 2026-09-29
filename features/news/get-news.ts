import "server-only";

// Market news from Finnhub (https://finnhub.io). Set FINNHUB_API_KEY in .env.local to enable.
// Responses are cached for 10 minutes. Without a key, the labelled sample set is returned.

import { getInstrument } from "@/features/market/instruments";
import { finnhubGet, hasFinnhubKey } from "@/lib/finnhub";
import { sampleNews } from "./sample";
import type { NewsArticle, NewsResult, NewsTopic } from "./types";

const REVALIDATE_SECONDS = 600;

type FinnhubArticle = { id: number; category: string; datetime: number; headline: string; image: string; related: string; source: string; summary: string; url: string };

type Options = { topic?: NewsTopic | "all"; symbol?: string; limit?: number };

function timeAgo(timestamp: number, now: number) {
  const minutes = Math.max(1, Math.round((now - timestamp) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const isHttps = (value: string) => /^https:\/\//i.test(value);

function fromFinnhub(item: FinnhubArticle, topic: NewsTopic, now: number): NewsArticle | null {
  if (!item.headline || !isHttps(item.url)) return null;
  const publishedAt = item.datetime * 1000;
  return {
    id: `fh-${item.id}`,
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    image: isHttps(item.image) ? item.image : undefined,
    publishedAt,
    timeAgo: timeAgo(publishedAt, now),
    symbols: item.related ? item.related.split(",").map(s => s.trim()).filter(Boolean) : [],
    topic,
  };
}

async function finnhub<T>(path: string, params: Record<string, string>): Promise<T> {
  const data = await finnhubGet<T>(path, params, REVALIDATE_SECONDS);
  if (data === null) throw new Error("FINNHUB_API_KEY is not set");
  return data;
}

function dedupe(articles: NewsArticle[]) {
  const seen = new Set<string>();
  return articles.filter(article => {
    const key = article.headline.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sampleResult({ topic = "all", symbol, limit = 8 }: Options, now: number): NewsResult {
  const items = sampleNews
    .filter(item => (symbol ? item.symbol === symbol : topic === "all" || item.topic === topic))
    .map(item => {
      const publishedAt = now - item.hoursAgo * 3_600_000;
      return { id: item.id, headline: item.headline, summary: item.summary, source: "Sample headline", publishedAt, timeAgo: timeAgo(publishedAt, now), symbols: item.symbol ? [item.symbol] : [], topic: item.topic };
    })
    .sort((a, b) => b.publishedAt - a.publishedAt);
  return { articles: items.slice(0, limit), live: false };
}

async function categoryNews(topic: NewsTopic, now: number) {
  const data = await finnhub<FinnhubArticle[]>("/news", { category: topic === "crypto" ? "crypto" : "general" });
  return data.map(item => fromFinnhub(item, topic, now)).filter((item): item is NewsArticle => item !== null);
}

export async function getMarketNews(options: Options = {}): Promise<NewsResult> {
  const { topic = "all", symbol, limit = 8 } = options;
  const now = Date.now();
  if (!hasFinnhubKey()) return sampleResult(options, now);

  try {
    if (symbol) {
      const instrument = getInstrument(symbol);
      if (instrument?.kind === "stock") {
        const day = (offset: number) => new Date(now - offset * 86_400_000).toISOString().slice(0, 10);
        const data = await finnhub<FinnhubArticle[]>("/company-news", { symbol, from: day(7), to: day(0) });
        const articles = dedupe(data.map(item => fromFinnhub(item, "stocks", now)).filter((item): item is NewsArticle => item !== null));
        return { articles: articles.slice(0, limit), live: true };
      }
      // Finnhub has no per-coin endpoint, so match the coin's name or symbol in crypto headlines.
      const crypto = dedupe(await categoryNews("crypto", now));
      const terms = [symbol, instrument?.name ?? symbol].map(term => term.toLowerCase());
      const matched = crypto.filter(item => terms.some(term => `${item.headline} ${item.summary}`.toLowerCase().includes(term)));
      return matched.length ? { articles: matched.slice(0, limit), live: true } : { articles: crypto.slice(0, limit), live: true, fallback: true };
    }

    const topics: NewsTopic[] = topic === "all" ? ["stocks", "crypto"] : [topic];
    const lists = await Promise.all(topics.map(item => categoryNews(item, now)));
    const articles = dedupe(lists.flat()).sort((a, b) => b.publishedAt - a.publishedAt);
    return { articles: articles.slice(0, limit), live: true };
  } catch (error) {
    console.error("Market news unavailable, showing sample headlines.", error);
    return sampleResult(options, now);
  }
}
