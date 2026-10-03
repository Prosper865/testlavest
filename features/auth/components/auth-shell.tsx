import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import styles from "./auth.module.css";
import { Icon } from "@/components/ui";

const benefits = [
  "Stocks, crypto, and automated plans in one account",
  "Trade Tesla and 20+ companies from $1 with fractional shares",
  "Signed, encrypted sessions and verified identities",
];

/** Split-screen layout shared by the login and sign-up pages. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.aside}>
        <Brand tone="light" />
        <div className={styles.pitch}>
          <h2>One account.<br /><span>Every way to invest.</span></h2>
          <ul>{benefits.map(item => <li key={item}><span aria-hidden="true"><Icon name="check" /></span>{item}</li>)}</ul>
        </div>
        <p className={styles.asideNote}>Platform preview: trading uses funds and live prices. Identity verification is part of the product experience.</p>
      </aside>
      <main id="main" className={styles.main}>
        <div className={styles.card}>{children}</div>
      </main>
    </div>
  );
}
