"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileIcon } from "./mobile-icon";
import styles from "./mobile-app.module.css";
import shell from "./mobile-shell.module.css";
import { Icon } from "@/components/ui";

const destinations = [
  ["Overview", "/dashboard"], ["Tesla", "/tesla"], ["Investments", "/investments"],
  ["Stocks", "/stocks"], ["Crypto", "/crypto"], ["Wallet", "/wallet"],
  ["Marketplace", "/marketplace"], ["Deposit", "/deposits"],
  ["Withdraw", "/withdrawals"], ["Plan payments", "/plans"],
] as const;

export function MobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className={`${styles.topbar} ${shell.header}`} onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
    <Link href="/dashboard" className={styles.appBrand} aria-label="Teslavest home" onClick={() => setOpen(false)}><span className={styles.brandMark}>T</span><span>Teslavest</span></Link>
    <button type="button" className={styles.iconButton} aria-label={open ? "Close app menu" : "Open app menu"} aria-expanded={open} aria-controls="mobile-pages" onClick={() => setOpen(value => !value)}>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={open ? "m6 6 12 12M6 18 18 6" : "M4 6h16M4 12h16M4 18h16"} /></svg>
    </button>
    <nav id="mobile-pages" aria-label="App pages" hidden={!open} className={shell.menu}>
      {destinations.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined} onClick={() => setOpen(false)}>{label}<span aria-hidden="true"><Icon name="arrow-up-right" /></span></Link>)}
    </nav>
  </header>;
}

const tabs = [
  { id: "home", label: "Home", href: "/dashboard" },
  { id: "markets", label: "Markets", href: "/dashboard?tab=markets" },
  { id: "trade", label: "Trade", href: "/dashboard?tab=trade" },
  { id: "wallet", label: "Wallet", href: "/dashboard?tab=wallet" },
  { id: "profile", label: "Profile", href: "/dashboard?tab=profile" },
];

export function MobilePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = ["/deposits", "/withdrawals", "/wallet", "/plans"].some(path => pathname.startsWith(path)) ? "wallet" : pathname.startsWith("/verify") ? "profile" : "markets";
  return <div className={styles.backdrop}><div className={styles.app}>
    <MobileHeader key={pathname} />
    <main id="main" className={`${styles.content} ${shell.content}`}>{children}</main>
    <nav className={styles.bottomNav} aria-label="App navigation">{tabs.map(tab => <Link key={tab.id} href={tab.href} className={`${styles.navItem} ${active === tab.id ? styles.navActive : ""} ${tab.id === "trade" ? styles.navTrade : ""}`}><span className={styles.navIcon}><MobileIcon name={tab.id} size={tab.id === "trade" ? 23 : 21} /></span><span>{tab.label}</span></Link>)}</nav>
  </div></div>;
}
