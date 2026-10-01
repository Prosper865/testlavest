"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAccount } from "./account-context";
import styles from "./account.module.css";

const copy = {
  not_started: { title: "Verify your identity to start trading.", text: "Deposits, trades, and automated plans unlock once you're verified. It takes about 3 minutes.", cta: "Verify now" },
  pending: { title: "Your verification is under review.", text: "We'll unlock trading as soon as it's approved, usually within one business day.", cta: "View status" },
  rejected: { title: "Your verification needs attention.", text: "We couldn't approve your last submission. See the reviewer's note and submit again.", cta: "Review & resubmit" },
} as const;

export function KycBanner() {
  const user = useAccount();
  const pathname = usePathname();
  if (user.role === "admin" || user.kycStatus === "approved" || pathname.startsWith("/verify")) return null;
  const content = copy[user.kycStatus];
  return (
    <aside className={cn(styles.banner, styles[user.kycStatus])} aria-label="Identity verification">
      <p><b>{content.title}</b> {content.text}</p>
      <Link href="/verify">{content.cta}</Link>
    </aside>
  );
}
