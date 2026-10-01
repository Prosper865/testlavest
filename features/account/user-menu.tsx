"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/features/auth/actions";
import { useAccount } from "./account-context";
import { KycStatusPill } from "./status-pill";
import { initials } from "@/lib/utils";
import styles from "./account.module.css";
import { Icon } from "@/components/ui";


export function UserMenu() {
  const user = useAccount();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={menu} className={styles.menu}>
      <button type="button" className={styles.trigger} aria-expanded={open} aria-haspopup="menu" aria-label={`Account menu for ${user.name}`} onClick={() => setOpen(!open)}>
        <span className={styles.avatar} aria-hidden="true">{initials(user.name)}</span>
        <span className={styles.chevron} aria-hidden="true"><Icon name="chevron-down" /></span>
      </button>
      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.who}>
            <b>{user.name}</b>
            <small>{user.email}</small>
            {user.role !== "admin" && <div className={styles.whoStatus}><KycStatusPill status={user.kycStatus} /></div>}
          </div>
          {user.role === "admin" && <Link role="menuitem" className={styles.item} href="/admin" onClick={() => setOpen(false)}>Admin console <span aria-hidden="true"><Icon name="arrow-right" /></span></Link>}
          {user.role !== "admin" && <Link role="menuitem" className={styles.item} href="/verify" onClick={() => setOpen(false)}>{user.kycStatus === "approved" ? "Verification status" : "Verify identity"} <span aria-hidden="true"><Icon name="arrow-right" /></span></Link>}
          <Link role="menuitem" className={styles.item} href="/" onClick={() => setOpen(false)}>Public website <span aria-hidden="true"><Icon name="arrow-up-right" /></span></Link>
          <form action={logout}>
            <button type="submit" role="menuitem" className={`${styles.item} ${styles.danger}`}>Log out</button>
          </form>
        </div>
      )}
    </div>
  );
}
