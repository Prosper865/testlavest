"use client";

import { useActionState } from "react";
import type { PaymentMethod } from "@/lib/db/schema";
import { savePaymentMethod } from "./actions";
import styles from "@/features/plans/components/plan-admin.module.css";

export function PaymentForm({ method }: { method?: Pick<PaymentMethod, "id" | "name" | "network" | "address"> }) {
  const [state, action, pending] = useActionState(savePaymentMethod, {});
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="id" value={method?.id ?? ""} />
      <div className={styles.grid}>
        <label><span>Payment method</span><input name="name" required maxLength={80} defaultValue={state.values?.name ?? method?.name ?? ""} placeholder="e.g. Bitcoin or USDT" /></label>
        <label><span>Network / provider</span><input name="network" required maxLength={80} defaultValue={state.values?.network ?? method?.network ?? ""} placeholder="e.g. Bitcoin, Ethereum (ERC-20)" /></label>
        <label className={styles.full}><span>Wallet / payment address</span><input name="address" maxLength={256} defaultValue={state.values?.address ?? method?.address ?? ""} placeholder="Paste the receiving address" autoComplete="off" spellCheck={false} /><small>Use an address for the selected network. Leave blank to mark this method as unconfigured.</small></label>
      </div>
      {state.message && <p role={state.ok ? "status" : "alert"} className={state.ok ? styles.saved : styles.alert}>{state.message}</p>}
      <div className={styles.actions}><button className={styles.primary} disabled={pending} type="submit">{pending ? "Saving…" : method ? "Save changes" : "Add payment method"}</button></div>
    </form>
  );
}
