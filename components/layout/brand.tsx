import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import styles from "./brand.module.css";

/** Logo lockup. `tone="light"` is for dark backgrounds. */
export function Brand({ tone = "dark", href = "/" }: { tone?: "dark" | "light"; href?: string }) {
  return (
    <Link href={href} className={cn(styles.brand, tone === "light" && styles.light)} aria-label={`${site.name} home`}>
      <span className={styles.mark}>{site.wordmark[0]}<span /></span>
      <span>{site.wordmark}<small>{site.wordmarkSub}</small></span>
    </Link>
  );
}
