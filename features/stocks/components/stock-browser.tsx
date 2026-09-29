"use client";

import { useState } from "react";
import { EmptyState, SegmentedControl } from "@/components/ui";
import { stocks, stockSectors } from "@/features/market/instruments";
import { useQuotes } from "@/features/market/quotes";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { StockCard } from "./stock-card";
import styles from "./stocks.module.css";

const filters = ["All stocks", ...stockSectors, "Watchlist"] as const;
type Filter = (typeof filters)[number];

export function StockBrowser() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All stocks");
  const quotes = useQuotes();
  const { watchlist } = usePortfolio();

  const visible = stocks.filter(stock => {
    const matchesQuery = `${stock.name} ${stock.symbol}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "All stocks" || (filter === "Watchlist" ? watchlist.includes(stock.symbol) : stock.sector === filter);
    return matchesQuery && matchesFilter;
  });

  return (
    <>
      <div className={styles.controls}>
        <SegmentedControl label="Filter stocks" options={filters} value={filter} onChange={setFilter} />
        <input className={styles.search} aria-label="Search stocks" placeholder="Search company or symbol…" value={query} onChange={event => setQuery(event.target.value)} />
      </div>
      <div className={styles.grid}>
        {visible.map(stock => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            quote={quotes[stock.symbol]}
            watched={watchlist.includes(stock.symbol)}
            onToggleWatch={() => portfolioActions.toggleWatch(stock.symbol)}
          />
        ))}
      </div>
      {visible.length === 0 && <EmptyState>No stocks found. Try another search or add companies to your watchlist.</EmptyState>}
    </>
  );
}
