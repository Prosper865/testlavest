"use client";

import { useActionState } from "react";
import { deletePaymentMethod, savePaymentMethod } from "./actions";
import type { PayMethod } from "./methods";
import styles from "@/features/plans/components/plan-admin.module.css";

type Props = { method?: PayMethod; kind?: "wallet" | "bank" };

export function PaymentForm({ method, kind = method?.kind ?? "wallet" }: Props) {
  const [state, action, pending] = useActionState(savePaymentMethod, {});
  const [removeState, removeAction, removing] = useActionState(deletePaymentMethod, {});
  const bank = kind === "bank";
  const value = (name: keyof PayMethod) => state.values?.[name] ?? method?.[name] ?? "";
  return (
    <>
      <form action={action} className={styles.form}>
        <input type="hidden" name="id" value={method?.id ?? ""} />
        <input type="hidden" name="kind" value={kind} />
        {bank ? (
          <div className={styles.grid}>
            <label><span>Bank name</span><input name="name" required maxLength={80} defaultValue={value("name")} placeholder="e.g. Chase Bank" /></label>
            <label><span>Account name</span><input name="accountName" required maxLength={120} defaultValue={value("accountName")} placeholder="Name on the account" /></label>
            <label><span>Account number / IBAN</span><input name="address" required maxLength={64} defaultValue={value("address")} placeholder="e.g. 0123456789" autoComplete="off" spellCheck={false} /></label>
            <label><span>Routing number / sort code / SWIFT</span><input name="routingNumber" maxLength={64} defaultValue={value("routingNumber")} placeholder="Optional" autoComplete="off" spellCheck={false} /></label>
            <label className={styles.full}><span>Payment instructions</span><textarea name="instructions" rows={3} maxLength={300} defaultValue={value("instructions")} placeholder="Optional, e.g. Use your email address as the transfer reference." /><small>Shown to users with the bank details.</small></label>
          </div>
        ) : (
          <div className={styles.grid}>
            <label><span>Payment method</span><input name="name" required maxLength={80} defaultValue={value("name")} placeholder="e.g. Bitcoin or USDT" /></label>
            <label><span>Network / provider</span><input name="network" required maxLength={80} defaultValue={value("network")} placeholder="e.g. Bitcoin, Ethereum (ERC-20)" /></label>
            <label className={styles.full}><span>Wallet / payment address</span><input name="address" maxLength={256} defaultValue={value("address")} placeholder="Paste the receiving address" autoComplete="off" spellCheck={false} /><small>Use an address for the selected network. Leave blank to mark this method as unconfigured.</small></label>
          </div>
        )}
        {state.message && <p role={state.ok ? "status" : "alert"} className={state.ok ? styles.saved : styles.alert}>{state.message}</p>}
        <div className={styles.actions}><button className={styles.primary} disabled={pending} type="submit">{pending ? "Saving…" : method ? "Save changes" : bank ? "Add bank account" : "Add payment method"}</button></div>
      </form>
      {method && (
        <form action={removeAction} onSubmit={event => { if (!window.confirm(`Remove ${method.name}? Users will no longer see it. Past payments keep their details.`)) event.preventDefault(); }}>
          <input type="hidden" name="id" value={method.id} />
          <button type="submit" className={styles.smallDanger} disabled={removing}>{removing ? "Removing…" : bank ? "Remove this bank account" : "Remove this payment method"}</button>
          {removeState.message && !removeState.ok && <p role="alert" className={styles.alert}>{removeState.message}</p>}
        </form>
      )}
    </>
  );
}
