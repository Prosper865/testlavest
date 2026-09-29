"use client";

import { useState } from "react";
import { EmptyState, SegmentedControl } from "@/components/ui";
import type { NewsArticle } from "../types";
import { ArticleItem, FeaturedArticle } from "./article-item";
import styles from "./news.module.css";

const tabs = ["All", "Stocks", "Crypto"] as const;
type Tab = (typeof tabs)[number];

function mergeLatest(...lists: NewsArticle[][]) {
  const byId = new Map(lists.flat().map(article => [article.id, article]));
  return [...byId.values()].sort((a, b) => b.publishedAt - a.publishedAt);
}

export function NewsTabs({ stocks, crypto }: { stocks: NewsArticle[]; crypto: NewsArticle[] }) {
  const [tab, setTab] = useState<Tab>("All");
  const articles = tab === "Stocks" ? stocks : tab === "Crypto" ? crypto : mergeLatest(stocks, crypto);
  const [featured, ...rest] = articles;

  return (
    <>
      <SegmentedControl label="News category" options={tabs} value={tab} onChange={setTab} />
      {featured ? (
        <div className={styles.feed}>
          <FeaturedArticle article={featured} />
          <ul className={styles.list}>{rest.slice(0, 5).map(article => <ArticleItem key={article.id} article={article} />)}</ul>
        </div>
      ) : (
        <EmptyState>No headlines right now. Check back shortly.</EmptyState>
      )}
    </>
  );
}
