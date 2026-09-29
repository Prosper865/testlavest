import Link from "next/link";
import { site } from "@/config/site";
import styles from "./brand.module.css";

export function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label={`${site.name} home`}>
      <span className={styles.mark}>{site.wordmark[0]}<span /></span>
      <span>{site.wordmark}<small>{site.wordmarkSub}</small></span>
    </Link>
  );
}
