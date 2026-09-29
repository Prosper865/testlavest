import type { Metadata } from "next";
import { PriceAlerts } from "@/features/alerts";
import { PlanList, RecurringBuyForm } from "@/features/investments";
import { QuotePanel } from "@/features/market";
import { SavingsGoalPlanner, SavingsGoalsList } from "@/features/marketplace";
import { NewsList } from "@/features/news";
import { OrderTicket } from "@/features/stocks";
import { buildKeyDates, CompanySnapshot, getTeslaData, KeyDatesPanel, Tesla101, TeslaBusinesses, TeslaHeader } from "@/features/tesla";
import teslaStyles from "@/features/tesla/components/tesla.module.css";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Tesla hub" };

export default async function TeslaPage() {
  const data = await getTeslaData();
  const events = buildKeyDates(data);

  return (
    <>
      <TeslaHeader />

      <div id="trade" className={styles.split}>
        <div className={styles.stack}>
          <QuotePanel symbol="TSLA" />
          <PriceAlerts symbol="TSLA" />
          <PlanList title="Your recurring TSLA buys" asset="TSLA" emptyText="No recurring TSLA buys yet. Set one up on the right." />
        </div>
        <div className={styles.stack}>
          <OrderTicket symbol="TSLA" />
          <RecurringBuyForm symbol="TSLA" />
        </div>
      </div>

      <h2 id="snapshot" className={teslaStyles.sectionTitle}>Company data &amp; key dates</h2>
      <div id="key-dates" className={styles.splitEven}>
        <CompanySnapshot data={data} />
        <KeyDatesPanel events={events} />
      </div>

      <h2 className={teslaStyles.sectionTitle}>What Tesla does</h2>
      <TeslaBusinesses />

      <h2 id="save" className={teslaStyles.sectionTitle}>Save for your Tesla</h2>
      <div className={styles.split}>
        <SavingsGoalsList />
        <SavingsGoalPlanner />
      </div>

      <h2 className={teslaStyles.sectionTitle}>Tesla news</h2>
      <NewsList symbol="TSLA" title="Latest Tesla headlines" limit={6} />

      <h2 id="learn" className={teslaStyles.sectionTitle}>Tesla 101</h2>
      <Tesla101 />
    </>
  );
}
