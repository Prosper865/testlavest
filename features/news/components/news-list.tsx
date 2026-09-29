import { EmptyState, Panel, PanelHeader, Tag } from "@/components/ui";
import { getInstrument } from "@/features/market/instruments";
import { getMarketNews } from "../get-news";
import type { NewsTopic } from "../types";
import { ArticleItem } from "./article-item";
import styles from "./news.module.css";

type Props = { symbol?: string; topic?: NewsTopic; title?: string; limit?: number };

export function NewsSourceTag({ live }: { live: boolean }) {
  return <Tag>{live ? "Live news" : "Sample headlines"}</Tag>;
}

export function NewsCredit({ live }: { live: boolean }) {
  if (!live) return <p className={styles.credit}>Add a news API key to show live headlines.</p>;
  return <p className={styles.credit}>News via <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer">Finnhub</a>. Headlines link to the original publishers.</p>;
}

/** Server component: fetches and renders headlines for a topic or a single symbol. */
export async function NewsList({ symbol, topic, title = "Market news", limit = 6 }: Props) {
  const { articles, live, fallback } = await getMarketNews({ symbol, topic, limit });
  const name = symbol ? getInstrument(symbol)?.name ?? symbol : undefined;

  return (
    <Panel aria-label={title}>
      <PanelHeader title={title} action={<NewsSourceTag live={live} />} />
      {fallback && <p className={styles.notice}>No recent {name} stories, so here is the latest crypto news.</p>}
      {articles.length === 0 ? (
        <EmptyState>No recent headlines{name ? ` for ${name}` : ""}.</EmptyState>
      ) : (
        <ul className={styles.list}>{articles.map(article => <ArticleItem key={article.id} article={article} />)}</ul>
      )}
      <NewsCredit live={live} />
    </Panel>
  );
}
