"use client";

import Link from "next/link";
import { useAccount } from "@/features/account";
import { money } from "@/lib/format";
import styles from "./checkout.module.css";

export function PaymentHistory() {
  const { planPayments, paymentSyncError } = useAccount();
  return <section className={styles.stack} aria-label="My plan payments">
    <h2>My plan payments</h2>
    {planPayments.payments.length > 0 && <p className={styles.notice}>Plan balance: <b>{money(planPayments.balanceAmount)}</b> · After purchases, sales and sent withdrawals. <Link href="/withdrawals">Withdraw / view requests</Link></p>}
    {paymentSyncError && <p role="status" className={styles.notice}>Status updates are temporarily unavailable. Your last saved status is shown; refresh to try again.</p>}
    {!planPayments.payments.length && <p className={styles.muted}>No plan payments yet. Choose a plan to get started.</p>}
    {planPayments.payments.map(payment => <article className={styles.card} key={payment.id}>
      <span className={`${styles.badge} ${styles[payment.status]}`}>{payment.status === "pending" ? "Under review" : payment.status === "approved" ? "Approved · Active plan" : "Rejected"}</span>
      <h3>{payment.planName}</h3><strong className={styles.amount}>{money(payment.amount)}</strong>
      <p>{payment.methodName} · {payment.network}</p>
      <p>{payment.status === "pending" ? "Your screenshot has been submitted. Your balance will update after approval." : payment.status === "approved" ? "This payment was credited to your investment balance. Sent withdrawals are reflected in the balance above." : "No balance was added. You can submit a new screenshot for this plan."}</p>
      {payment.reviewNote && <p><b>Admin note:</b> {payment.reviewNote}</p>}
      <div className={styles.actions}>
        <a href={`/api/plan-payments/${payment.id}/receipt`} target="_blank" rel="noreferrer" className={styles.secondary}>View screenshot</a>
        {payment.status === "rejected" && payment.planId && <Link href={`/plans/${payment.planId}`} className={styles.button}>Try again</Link>}
      </div>
    </article>)}
  </section>;
}
