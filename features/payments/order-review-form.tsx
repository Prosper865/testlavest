"use client";

import { useActionState } from "react";
import { reviewOrderReceipt } from "./order-actions";
import styles from "./checkout.module.css";

export function OrderReviewForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reviewOrderReceipt, {});
  return <form action={action} className={styles.form}>
    <input type="hidden" name="id" value={id} />
    <label className={styles.field}>Review note (optional)<textarea name="note" maxLength={500} placeholder="Visible to the user" /></label>
    <div className={styles.actions}>
      <button name="decision" value="approved" className={styles.button} disabled={pending}>Approve order</button>
      <button name="decision" value="rejected" className={styles.secondary} disabled={pending}>Reject order</button>
    </div>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
