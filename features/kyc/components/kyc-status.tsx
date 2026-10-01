import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { KycStatus } from "@/lib/db/schema";
import styles from "./kyc.module.css";

type Props = { status: KycStatus; submittedAt: Date; reviewedAt: Date | null; reviewNote: string | null };

const copy: Record<KycStatus, { icon: string; title: string; text: string }> = {
  pending: { icon: "⏳", title: "Verification in review", text: "Thanks! Our team is reviewing your details. This usually takes less than one business day. You can explore the platform meanwhile; trading unlocks once you're approved." },
  approved: { icon: "✓", title: "You're verified", text: "Your identity has been confirmed. Trading, transfers, and automated plans are now unlocked on your account." },
  rejected: { icon: "!", title: "Verification not approved", text: "We couldn't verify your identity with the details provided. Review the note below and submit again." },
};

export function KycStatusCard({ status, submittedAt, reviewedAt, reviewNote }: Props) {
  const content = copy[status];
  return (
    <section className={cn(styles.card, styles.status, styles[status])} aria-live="polite">
      <div className={styles.statusIcon} aria-hidden="true">{content.icon}</div>
      <h1>{content.title}</h1>
      <p>{content.text}</p>
      {status === "rejected" && reviewNote && <p className={styles.note}><b>Reviewer note:</b> {reviewNote}</p>}
      <ol className={styles.timeline}>
        <li className={styles.reached}><span /><div>Submitted<small>{formatDateTime(submittedAt.getTime())}</small></div></li>
        <li className={status !== "pending" ? styles.reached : undefined}><span /><div>{status === "pending" ? "Review in progress" : status === "approved" ? "Approved" : "Not approved"}<small>{reviewedAt ? formatDateTime(reviewedAt.getTime()) : "Usually within 1 business day"}</small></div></li>
      </ol>
      <div className={styles.statusActions}>
        {status === "rejected" && <Link href="/verify?resubmit=1" className={buttonClass()}>Submit again</Link>}
        <Link href="/dashboard" className={buttonClass({ variant: status === "rejected" ? "outline" : "primary" })}>{status === "approved" ? "Start investing" : "Go to dashboard"}</Link>
      </div>
    </section>
  );
}
