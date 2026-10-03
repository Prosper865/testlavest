"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { logout } from "@/features/auth/actions";
import { cn, initials } from "@/lib/utils";
import { Icon, type IconName } from "./icons";
import styles from "./admin.module.css";

const nav: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: "/admin", label: "Overview", icon: "overview", exact: true },
  { href: "/admin/kyc", label: "KYC reviews", icon: "kyc" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/plans", label: "Investment plans", icon: "plans" },
  { href: "/admin/marketplace", label: "Marketplace cars", icon: "car" },
  { href: "/admin/vehicle-orders", label: "Car orders", icon: "payments" },
  { href: "/admin/payments", label: "Payment methods", icon: "payments" },
  { href: "/admin/plan-payments", label: "Payment reviews", icon: "payments" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "payments" },
  { href: "/admin/activity", label: "Activity log", icon: "activity" },
];

type Props = { admin: { name: string; email: string }; pendingCount: number; children: ReactNode };

export function AdminShell({ admin, pendingCount, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <aside className={cn(styles.sidebar, open && styles.sidebarOpen)} aria-label="Admin navigation">
      <div className={styles.sidebarBrand}><Brand href="/admin" /><span className={styles.consoleTag}>Admin</span></div>
      <p className={styles.navLabel}>Manage</p>
      {nav.map(item => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={styles.navLink} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
            <Icon name={item.icon} />{item.label}
            {item.icon === "kyc" && pendingCount > 0 && <span className={styles.count} aria-label={`${pendingCount} pending`}>{pendingCount}</span>}
          </Link>
        );
      })}
      <div className={styles.sidebarFoot}>
        <Link href="/" className={styles.navLink}><Icon name="site" />Public website</Link>
        <form action={logout}><button type="submit" className={cn(styles.navLink, styles.logout)}><Icon name="logout" />Log out</button></form>
        <div className={styles.me}>
          <span className={styles.avatar} aria-hidden="true">{initials(admin.name)}</span>
          <div><b>{admin.name}</b><small>{admin.email}</small></div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className={styles.app}>
      {sidebar}
      <div>
        <header className={styles.topbar}>
          <Brand href="/admin" />
          <button type="button" className={styles.menuBtn} aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="menu" />Menu</button>
        </header>
        {open && <button type="button" aria-label="Close menu" className={styles.backdrop} onClick={() => setOpen(false)} />}
        <main id="main" className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
