import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import styles from "./brand.module.css";

/** Logo lockup. `tone="light"` is for dark backgrounds. */
export function Brand({ tone = "dark", href = "/" }: { tone?: "dark" | "light"; href?: string }) {
  return (
    <Link href={href} className={cn(styles.brand, tone === "light" && styles.light)} aria-label={`${site.name} home`}>
      <Image src="/logos/images.jpg" alt="" width={37} height={37} className={styles.mark} />
      <span>{site.wordmark}<small>{site.wordmarkSub}</small></span>
    </Link>
  );
}
