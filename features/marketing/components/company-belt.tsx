import { MarketLogo } from "@/features/market/components/market-logo";
import { cn } from "@/lib/utils";
import styles from "./markets.module.css";

const companies = [["TSLA", "TESLA"], ["NVDA", "NVIDIA"], ["AAPL", "Apple"], ["MSFT", "Microsoft"], ["V", "VISA"]];

export function CompanyBelt() {
  return (
    <section className={cn("shell", styles.belt)} aria-label="Featured market companies">
      <p>THE COMPANIES SHAPING TOMORROW<span>Explore global equities · No affiliation implied</span></p>
      <div>
        {companies.map(([symbol, name]) => (
          <span key={symbol}><MarketLogo symbol={symbol} className={styles.beltLogo} /><b>{name}</b></span>
        ))}
      </div>
    </section>
  );
}
