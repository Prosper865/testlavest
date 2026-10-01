"use client";

import { useActionState } from "react";
import { saveUserProfit } from "../profit-actions";
import { money } from "@/lib/format";
import styles from "@/features/payments/checkout.module.css";

export function ProfitForm({ userId, name, profitCents }: { userId: string; name: string; profitCents: number }) {
  const [state, action, pending] = useActionState(saveUserProfit, {});
  return <form action={action} className={styles.form}>
    <input type="hidden" name="userId" value={userId} />
    <input type="hidden" name="expectedCents" value={profitCents} />
    <p>Current profit for <b>{name}</b>: <b>{money(profitCents / 100)}</b></p>
    <label className={styles.field}>Total profit (USD)
      <input name="profit" type="text" inputMode="decimal" required maxLength={15} defaultValue={(profitCents / 100).toFixed(2)} />
    </label>
    <p className={styles.muted}>Set this user’s total profit. This replaces their previous profit and updates their balance; it does not add the entered amount a second time.</p>
    <button className={styles.button} type="submit" disabled={pending}>{pending ? "Saving…" : "Update this user’s profit"}</button>
    {state.message && <p role={state.ok ? "status" : "alert"} className={state.ok ? styles.notice : styles.error}>{state.message}</p>}
  </form>;
}
