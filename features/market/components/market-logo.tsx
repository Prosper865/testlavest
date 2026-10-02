import Image from "next/image";
import { cn } from "@/lib/utils";
import { getInstrument } from "../instruments";
import { companyLogos } from "../logos";
import styles from "./market-logo.module.css";

// Logos identify market instruments and do not imply affiliation or endorsement.
export function MarketLogo({ symbol, className }: { symbol: string; className?: string }) {
  const item = getInstrument(symbol);
  const label = `${item?.name ?? symbol} logo`;

  if (item?.kind === "forex" && item.flags) {
    return (
      <span className={cn(styles.logo, styles.pair, className)} role="img" aria-label={item.name}>
        {item.flags.map(code => <Image key={code} src={`/flags/${code}.svg`} alt="" width={28} height={28} />)}
      </span>
    );
  }
  if (item?.logo) {
    return (
      <span className={cn(styles.logo, item.sector === "Pre-IPO" ? styles.private : styles.coin, className)}>
        <Image src={item.logo} alt={label} width={43} height={43} />
      </span>
    );
  }
  if (symbol === "MSFT") {
    return (
      <span className={cn(styles.logo, className)}>
        <span className={styles.microsoft} role="img" aria-label={label}><i /><i /><i /><i /></span>
      </span>
    );
  }
  const icon = companyLogos[symbol];
  return (
    <span className={cn(styles.logo, className)}>
      {icon ? (
        <svg viewBox="0 0 24 24" role="img" aria-label={label} fill={`#${icon.hex}`}><path d={icon.path} /></svg>
      ) : (
        <b aria-hidden="true">{symbol.slice(0, 2)}</b>
      )}
    </span>
  );
}
