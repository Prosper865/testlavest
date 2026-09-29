import { SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getMarketNews } from "../get-news";
import { NewsCredit, NewsSourceTag } from "./news-list";
import { NewsTabs } from "./news-tabs";
import styles from "./news.module.css";

/** Homepage news section: the same feed as the dashboard, laid out as a site section. */
export async function NewsSection() {
  const [stocks, crypto] = await Promise.all([getMarketNews({ topic: "stocks", limit: 8 }), getMarketNews({ topic: "crypto", limit: 8 })]);
  const live = stocks.live || crypto.live;
  return (
    <section className={cn("shell", styles.section)} id="news" aria-labelledby="news-heading">
      <SectionHeading
        id="news-heading"
        eyebrow="Stay informed"
        title={<>The stories moving<br /><span className="accent-text">stocks and crypto.</span></>}
        aside={<NewsSourceTag live={live} />}
      />
      <div className={styles.sectionCard}>
        <NewsTabs stocks={stocks.articles} crypto={crypto.articles} />
        <NewsCredit live={live} />
      </div>
    </section>
  );
}
