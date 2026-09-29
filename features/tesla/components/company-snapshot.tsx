import { EmptyState, Panel, PanelHeader, Tag } from "@/components/ui";
import { formatDate, money, percent } from "@/lib/format";
import type { TeslaData } from "../get-tesla-data";
import styles from "./tesla.module.css";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className={styles.metric}><small>{label}</small><b>{value}</b></div>;
}

/** Real company figures from Finnhub. Separate from the simulated trading price. */
export function CompanySnapshot({ data }: { data: TeslaData }) {
  const { quote, profile, metrics } = data;
  const position = quote && metrics ? Math.min(100, Math.max(0, ((quote.price - metrics.low52) / (metrics.high52 - metrics.low52)) * 100)) : null;

  return (
    <Panel aria-label="Tesla company data">
      <PanelHeader title="Company snapshot" action={<Tag>{data.live ? "Real market data" : "Unavailable"}</Tag>} />
      {!data.live ? (
        <EmptyState>Add a Finnhub API key to show Tesla&apos;s market value, valuation, and 52-week range.</EmptyState>
      ) : (
        <>
          <div className={styles.metrics}>
            {quote && <Metric label="Last price" value={<>{money(quote.price)} <span className={quote.changePercent >= 0 ? "positive" : "negative"}>{percent(quote.changePercent)}</span></>} />}
            {profile && <Metric label="Market value" value={`$${compact.format(profile.marketCap)}`} />}
            {metrics?.pe !== undefined && <Metric label="P/E ratio (TTM)" value={metrics.pe.toFixed(1)} />}
            {metrics?.beta !== undefined && <Metric label="Beta (volatility vs market)" value={metrics.beta.toFixed(2)} />}
            {profile && <Metric label="Shares outstanding" value={compact.format(profile.sharesOutstanding)} />}
            {profile && <Metric label="Listed since" value={formatDate(Date.parse(profile.ipo))} />}
          </div>
          {metrics && (
            <div className={styles.range}>
              <div><span>52-week low {money(metrics.low52)}</span><span>52-week high {money(metrics.high52)}</span></div>
              <div className={styles.track}>{position !== null && <i style={{ left: `${position}%` }} aria-hidden="true" />}</div>
              {position !== null && <p>The last price is {Math.round(position)}% of the way from the 52-week low to the high.</p>}
            </div>
          )}
          <p className={styles.source}>
            Market data via <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer">Finnhub</a>, may be delayed{quote ? ` (as of ${formatDate(quote.asOf)})` : ""}. The trading demo simulates prices starting from real values.
            {profile && <> Company site: <a href={profile.website} target="_blank" rel="noopener noreferrer">tesla.com</a>.</>}
          </p>
        </>
      )}
    </Panel>
  );
}
