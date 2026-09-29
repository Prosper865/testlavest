import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Strategy } from "../strategies";
import styles from "./investments.module.css";

type Props = { strategy: Strategy; index: number; selected?: boolean; children?: ReactNode };

/** Strategy summary. `children` renders in the card footer (details, a CTA, or a select button). */
export function StrategyCard({ strategy, index, selected = false, children }: Props) {
  return (
    <article className={cn(styles.card, selected && styles.selected)}>
      <div className={styles.art} style={{ backgroundImage: `url(${strategy.image})` }}>
        <span>0{index + 1} / STRATEGIES</span>
        <small>{strategy.tag}</small>
      </div>
      <div className={styles.copy}>
        <div className={styles.risk}>{strategy.risk} <span>Concept portfolio</span></div>
        <h3>{strategy.name}</h3>
        <p>{strategy.description}</p>
        <div className={styles.footer}>{children}</div>
      </div>
    </article>
  );
}

export function StrategyGrid({ children }: { children: ReactNode }) {
  return <div className={styles.strategyGrid}>{children}</div>;
}

export function StrategyDetails({ strategy, children }: { strategy: Strategy; children?: ReactNode }) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>Explore strategy <span aria-hidden="true">↗</span></summary>
      <p>{strategy.allocation}. This is an illustrative allocation, not an available fund or a recommendation. Investment values can fall as well as rise.</p>
      {children}
    </details>
  );
}
