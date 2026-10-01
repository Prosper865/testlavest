"use client";

import { useActionState } from "react";
import { markWithdrawal } from "./actions";
import { money } from "@/lib/format";
import styles from "@/features/payments/checkout.module.css";

export function WithdrawalReviewForm({ id, amountCents }: { id: string; amountCents: number }) {
  const [state, action, pending] = useActionState(markWithdrawal, {});
  return <form action={action} className={styles.form}>
    <input type="hidden" name="id" value={id} />
    <p className={styles.notice}>Marking this request as sent deducts {money(amountCents / 100)} from the user’s balance.</p>
    <label className={styles.field}>Review note (optional)<textarea name="note" maxLength={500} placeholder="Visible to the user" /></label>
    <div className={styles.actions}>
      <button type="submit" name="decision" value="sent" className={styles.button} disabled={pending}>{pending ? "Saving…" : "Mark as sent"}</button>
      <button type="submit" name="decision" value="rejected" className={styles.secondary} disabled={pending}>Reject request</button>
    </div>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
