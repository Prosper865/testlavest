import { Panel, PanelHeader } from "@/components/ui";
import { getMarketNews } from "../get-news";
import { NewsCredit, NewsSourceTag } from "./news-list";
import { NewsTabs } from "./news-tabs";

/** Dashboard news: stock and crypto headlines with category tabs. */
export async function MarketNews() {
  const [stocks, crypto] = await Promise.all([getMarketNews({ topic: "stocks", limit: 8 }), getMarketNews({ topic: "crypto", limit: 8 })]);
  const live = stocks.live || crypto.live;
  return (
    <Panel aria-label="Market news">
      <PanelHeader title="Market news" action={<NewsSourceTag live={live} />} />
      <NewsTabs stocks={stocks.articles} crypto={crypto.articles} />
      <NewsCredit live={live} />
    </Panel>
  );
}
