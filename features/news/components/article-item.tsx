import type { NewsArticle } from "../types";
import styles from "./news.module.css";

function Headline({ article, children }: { article: NewsArticle; children: React.ReactNode }) {
  if (!article.url) return <>{children}</>;
  return <a href={article.url} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function ArticleMeta({ article }: { article: NewsArticle }) {
  return (
    <div className={styles.meta}>
      {article.symbols.slice(0, 2).map(symbol => <span key={symbol} className={styles.symbol}>{symbol}</span>)}
      <b>{article.source}</b>
      <span>{article.timeAgo}</span>
    </div>
  );
}

export function ArticleItem({ article }: { article: NewsArticle }) {
  return (
    <li className={styles.item}>
      <div>
        <ArticleMeta article={article} />
        <Headline article={article}>
          <h3>{article.headline}{article.url && <span className={styles.external} aria-label="(opens in a new tab)"> ↗</span>}</h3>
        </Headline>
        {article.summary && <p>{article.summary}</p>}
      </div>
      {article.image && (
        // Publisher images come from many domains, so they bypass next/image optimisation.
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.thumb} src={article.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
      )}
    </li>
  );
}

export function FeaturedArticle({ article }: { article: NewsArticle }) {
  return (
    <article className={styles.featured}>
      {article.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <div className={styles.featuredArt} aria-hidden="true">{article.topic === "crypto" ? "CRYPTO MARKETS" : "STOCK MARKETS"}</div>
      )}
      <ArticleMeta article={article} />
      <Headline article={article}><h3>{article.headline}</h3></Headline>
      {article.summary && <p>{article.summary}</p>}
    </article>
  );
}
