import { MarketLogo } from "@/features/market/components/market-logo";
import styles from "./tesla.module.css";

const sections = [
  ["#trade", "Trade"],
  ["#snapshot", "Company data"],
  ["#key-dates", "Key dates"],
  ["#save", "Save for a Tesla"],
  ["#learn", "Tesla 101"],
] as const;

export function TeslaHeader() {
  return (
    <header className={styles.hero}>
      <div>
        <div className={styles.brand}>
          <MarketLogo symbol="TSLA" />
          <div><small>NASDAQ · TSLA</small><h1>Tesla hub</h1></div>
        </div>
        <p>Everything Tesla in one place: trade the stock from $1, automate recurring buys, follow the company&apos;s key dates and news, and save toward your own Tesla.</p>
      </div>
      <nav className={styles.jump} aria-label="Tesla hub sections">
        {sections.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
      </nav>
    </header>
  );
}
