import Link from "next/link";
import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import styles from "./admin.module.css";

const pillLabels: Record<string, string> = {
  pending: "Pending", approved: "Approved", rejected: "Rejected", not_started: "Not started",
  active: "Active", suspended: "Suspended", admin: "Admin", featured: "Most popular",
};

export function Pill({ status }: { status: string }) {
  return <span className={cn(styles.pill, styles[status])}>{pillLabels[status] ?? status}</span>;
}

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  return <span className={cn(styles.avatar, large && styles.avatarLg)} aria-hidden="true">{initials(name)}</span>;
}

export function PageHeader({ title, description, back, actions }: { title: string; description?: string; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        {back && <Link href={back.href} className={styles.crumb}>← {back.label}</Link>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ title, action, children, bodyless = false, className }: { title?: string; action?: ReactNode; children: ReactNode; bodyless?: boolean; className?: string }) {
  return (
    <section className={cn(styles.card, className)} aria-label={title}>
      {title && <div className={styles.cardHead}><h2>{title}</h2>{action}</div>}
      {bodyless ? children : <div className={styles.cardBody}>{children}</div>}
    </section>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className={styles.empty}><b>{title}</b>{children}</div>;
}

const auditText: Record<string, (actor: string, target: string, detail: string | null) => string> = {
  "user.profit_updated": (actor, target, detail) => `${actor} updated ${target}'s profit: ${detail}`,
  "withdrawal.requested": (_actor, target, detail) => `${target} requested a withdrawal: ${detail}`,
  "withdrawal.sent": (actor, target, detail) => `${actor} marked ${target}'s withdrawal as sent: ${detail}`,
  "withdrawal.rejected": (actor, target, detail) => `${actor} rejected ${target}'s withdrawal: ${detail}`,
  "plan_payment.submitted": (_actor, target, detail) => `${target} submitted a plan payment: ${detail}`,
  "plan_payment.approved": (actor, target, detail) => `${actor} approved ${target}'s plan payment: ${detail}`,
  "plan_payment.rejected": (actor, target, detail) => `${actor} rejected ${target}'s plan payment: ${detail}`,
  "payment_method.saved": (actor, _target, detail) => `${actor} saved payment method ${detail ?? ""}`,
  "user.signup": (_a, target) => `${target} created an account`,
  "user.login": (_a, target) => `${target} logged in`,
  "user.login_failed": (_a, target) => `Failed login attempt for ${target}`,
  "kyc.submitted": (_a, target) => `${target} submitted identity verification`,
  "kyc.approved": (actor, target) => `${actor} approved ${target}'s verification`,
  "kyc.rejected": (actor, target, detail) => `${actor} rejected ${target}'s verification${detail ? `: “${detail}”` : ""}`,
  "user.suspended": (actor, target) => `${actor} suspended ${target}`,
  "user.reactivated": (actor, target) => `${actor} reactivated ${target}`,
  "user.role_changed": (actor, target, detail) => `${actor} changed ${target}'s role to ${detail}`,
};

export function describeAudit(entry: { action: string; actorName: string | null; targetName: string | null; detail: string | null }) {
  const text = auditText[entry.action];
  return text ? text(entry.actorName ?? "System", entry.targetName ?? "a deleted user", entry.detail) : entry.action;
}

export function auditTone(action: string) {
  if (action === "kyc.approved" || action === "user.reactivated") return styles.good;
  if (action === "kyc.submitted" || action === "user.role_changed") return styles.warn;
  if (action === "kyc.rejected" || action === "user.suspended" || action === "user.login_failed") return styles.bad;
  return undefined;
}

export const documentLabels: Record<string, string> = { passport: "Passport", drivers_license: "Driver's licence", national_id: "National ID card" };
