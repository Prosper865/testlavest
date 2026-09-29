export type NewsTopic = "stocks" | "crypto";

export type NewsArticle = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url?: string;
  image?: string;
  publishedAt: number;
  /** Relative time, formatted on the server so client rendering stays consistent. */
  timeAgo: string;
  symbols: string[];
  topic: NewsTopic;
};

export type NewsResult = {
  articles: NewsArticle[];
  /** True when the articles came from the live provider rather than the sample set. */
  live: boolean;
  /** True when no symbol-specific stories were found and the latest topic news is shown instead. */
  fallback?: boolean;
};
