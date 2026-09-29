"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { platformNav } from "@/config/site";
import { usePortfolio } from "@/features/portfolio/store";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { Brand } from "./brand";
import styles from "./header.module.css";

export function PlatformHeader() {
  const pathname = usePathname();
  const { cash } = usePortfolio();
  return (
    <div className={styles.platformBar}>
      <header className={cn("shell", styles.platformHeader)}>
        <Brand />
        <nav className={styles.tabs} aria-label="Platform navigation">
          {platformNav.map(link => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>{link.label}</Link>;
          })}
        </nav>
        <div className={styles.account}>
          <div>Buying power<b>{money(cash)}</b></div>
          <Link href="/">Website ↗</Link>
        </div>
      </header>
    </div>
  );
}
