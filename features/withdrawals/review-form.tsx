"use client";

import { useActionState } from "react";
import { markWithdrawal } from "./actions";
import { NETWORK_ISSUE_MESSAGE } from "./messages";
import styles from "@/features/payments/checkout.module.css";

export function WithdrawalReviewForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(markWithdrawal, {});
  return <form action={action} className={styles.form}>
    <input type="hidden" name="id" value={id} />
    <label className={styles.field}>Custom message or review note<textarea name="note" maxLength={500} placeholder="Write an update for this user (up to 500 characters)" /></label>
    <div className={styles.actions}>
      <button type="submit" name="decision" value="network_issue" className={styles.secondary} disabled={pending}>Send network issues</button>
      <button type="submit" name="decision" value="message" className={styles.secondary} disabled={pending}>Send custom message</button>
    </div>
    <p className={styles.muted}>Network issues sends: “{NETWORK_ISSUE_MESSAGE}” Updates appear in the user’s withdrawal history and replace the previous update. They keep the request pending.</p>
    <div className={styles.actions}>
      <button type="submit" name="decision" value="sent" className={styles.button} disabled={pending}>{pending ? "Saving…" : "Mark as sent"}</button>
      <button type="submit" name="decision" value="rejected" className={styles.secondary} disabled={pending}>Reject request</button>
    </div>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
