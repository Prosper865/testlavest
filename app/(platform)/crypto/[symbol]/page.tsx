import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CryptoOrderTicket } from "@/features/crypto";
import { PlanList, RecurringBuyForm } from "@/features/investments";
import { cryptoAssets, getCrypto, QuotePanel } from "@/features/market";
import { NewsList } from "@/features/news";
import { PriceAlerts } from "@/features/alerts";
import styles from "../../platform.module.css";

export function generateStaticParams() {
  return cryptoAssets.map(asset => ({ symbol: asset.symbol }));
}

export async function generateMetadata({ params }: PageProps<"/crypto/[symbol]">): Promise<Metadata> {
  const asset = getCrypto((await params).symbol);
  return { title: asset ? `${asset.name} (${asset.symbol})` : "Coin not found" };
}

export default async function CoinPage({ params }: PageProps<"/crypto/[symbol]">) {
  const asset = getCrypto((await params).symbol);
  if (!asset) notFound();

  return (
    <>
      <Link href="/crypto" className={styles.back}>← All crypto</Link>
      <div className={styles.split}>
        <div className={styles.stack}>
          <QuotePanel symbol={asset.symbol} />
          <PlanList title={`Your recurring ${asset.symbol} buys`} asset={asset.symbol} emptyText={`No recurring ${asset.symbol} buys yet.`} />
        </div>
        <div className={styles.stack}>
          <CryptoOrderTicket symbol={asset.symbol} />
          <RecurringBuyForm symbol={asset.symbol} />
          <PriceAlerts symbol={asset.symbol} />
          <NewsList symbol={asset.symbol} title={`${asset.name} news`} />
        </div>
      </div>
    </>
  );
}
