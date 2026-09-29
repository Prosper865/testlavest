import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStock, QuotePanel, stocks } from "@/features/market";
import { NewsList } from "@/features/news";
import { OrderTicket } from "@/features/stocks";
import { PriceAlerts } from "@/features/alerts";
import { RecurringBuyForm } from "@/features/investments";
import styles from "../../platform.module.css";

export function generateStaticParams() {
  return stocks.map(stock => ({ symbol: stock.symbol }));
}

export async function generateMetadata({ params }: PageProps<"/stocks/[symbol]">): Promise<Metadata> {
  const stock = getStock((await params).symbol);
  return { title: stock ? `${stock.name} (${stock.symbol})` : "Stock not found" };
}

export default async function StockPage({ params }: PageProps<"/stocks/[symbol]">) {
  const stock = getStock((await params).symbol);
  if (!stock) notFound();

  return (
    <>
      <Link href="/stocks" className={styles.back}>← All stocks</Link>
      <div className={styles.split}>
        <QuotePanel symbol={stock.symbol} />
        <div className={styles.stack}>
          <OrderTicket symbol={stock.symbol} />
          <RecurringBuyForm symbol={stock.symbol} />
          <PriceAlerts symbol={stock.symbol} />
          <NewsList symbol={stock.symbol} title={`${stock.name} news`} />
        </div>
      </div>
    </>
  );
}
