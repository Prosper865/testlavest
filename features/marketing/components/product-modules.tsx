import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { products } from "../content";
import styles from "./product-modules.module.css";

function ProductIcon({ kind }: { kind: (typeof products)[number]["icon"] }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "plan" && <><circle cx="16" cy="16" r="11" /><path d="M16 9v7l5 3" /><path d="M24 4v5h-5" /></>}
      {kind === "chart" && <><path d="M5 5v22h23M9 20l6-7 5 3 7-10" /><path d="M21 6h6v6" /></>}
      {kind === "wallet" && <><rect x="4" y="8" width="24" height="18" rx="3" /><path d="M4 13h24M21 19h3M8 8l12-4 2 4" /></>}
      {kind === "car" && <><path d="M5 20v-4l3-6h16l3 6v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" /><path d="M5 16h22" /><circle cx="10" cy="22" r="2" /><circle cx="22" cy="22" r="2" /></>}
    </svg>
  );
}

export function ProductModules() {
  return (
    <section className={cn("shell", styles.section)} id="products" aria-labelledby="products-heading">
      <SectionHeading
        id="products-heading"
        eyebrow="One platform. Four ways to grow."
        title={<>Everything you invest in,<br /><span className="accent-text">in one place.</span></>}
        aside="Automate your investing, follow the markets in real time, manage crypto, and shop a curated EV selection."
      />
      <div className={styles.grid}>
        {products.map(product => (
          <Link key={product.href} href={product.href} className={styles.card}>
            <div className={styles.top}>
              <span className={styles.icon}><ProductIcon kind={product.icon} /></span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </div>
            <span className={styles.label}>{product.label}</span>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
