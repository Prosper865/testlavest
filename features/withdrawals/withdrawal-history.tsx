"use client";

import { useAccount } from "@/features/account";
import { money } from "@/lib/format";
import styles from "@/features/payments/checkout.module.css";

export function WithdrawalHistory() {
  const { planPayments } = useAccount();
  return <section className={styles.stack} aria-label="Withdrawal history">
    <h2>Withdrawal history</h2>
    {!planPayments.withdrawals.length && <p className={styles.muted}>No withdrawal requests yet.</p>}
    {planPayments.withdrawals.map(request => <article key={request.id} className={styles.card}>
      <span className={`${styles.badge} ${styles[request.status === "sent" ? "approved" : request.status]}`}>{request.status === "pending" ? "Pending review" : request.status === "sent" ? "Sent" : "Rejected"}</span>
      <strong className={styles.amount}>{money(request.amountCents / 100)}</strong>
      <p>{request.bankName} · Account ending {request.accountLast4}</p>
      <p>{request.status === "pending" ? "Your request is waiting for an admin." : request.status === "sent" ? "Marked as sent by an admin." : "This request was rejected and the reserved amount is available again."}</p>
      {request.reviewNote && <p className={styles.notice} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><b>{request.status === "pending" ? "Update from admin:" : "Admin note:"}</b> {request.reviewNote}</p>}
      <p className={styles.muted}>Requested {new Date(request.submittedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}{request.reviewedAt && ` · Reviewed ${new Date(request.reviewedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}`}</p>
    </article>)}
  </section>;
}
