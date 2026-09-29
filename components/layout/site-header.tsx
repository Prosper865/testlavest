"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui";
import { marketingNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import styles from "./header.module.css";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);

  // Close the dropdown on Escape or a tap outside the header.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const onPointer = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header ref={header} className={cn("shell", styles.header)}>
      <Brand />
      <button className={styles.menuToggle} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
        Menu <span aria-hidden="true">{open ? "✕" : "☰"}</span>
      </button>
      <nav id="site-navigation" className={cn(styles.nav, open && styles.navOpen)} aria-label="Main navigation">
        {marketingNav.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <ButtonLink href="/dashboard" className={styles.menuCta} onClick={() => setOpen(false)}>Open platform</ButtonLink>
      </nav>
      <ButtonLink href="/dashboard" className={styles.cta}>Open platform</ButtonLink>
    </header>
  );
}
