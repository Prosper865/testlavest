"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useAccount } from "@/features/account";
import { money } from "@/lib/format";
import { submitWithdrawal } from "./actions";
import styles from "@/features/payments/checkout.module.css";

const fields = [
  { name: "beneficiaryName", label: "Beneficiary name", placeholder: "Full name or business name", max: 120 },
  { name: "accountNumber", label: "Account number", placeholder: "Recipient’s account number", max: 34, pattern: "[0-9]{4,34}" },
  { name: "routingNumber", label: "Routing number", placeholder: "9-digit routing number", max: 9, pattern: "[0-9]{9}" },
  { name: "bankName", label: "Bank name", placeholder: "Recipient’s bank", max: 120 },
  { name: "recipientAddress", label: "Recipient address", placeholder: "Street, city, state, ZIP code", max: 500, multiline: true },
  { name: "bankAddress", label: "Bank address", placeholder: "Bank’s street, city, state, ZIP code", max: 500, multiline: true },
];

export function WithdrawalForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(submitWithdrawal, {});
  const { planPayments, paymentSyncError } = useAccount();
  return <div className={styles.card}>
    <h2>Request a withdrawal</h2>
    <p className={styles.notice}>Withdrawal only. Your balance is deducted when an admin marks the request as sent. No real bank transfer takes place.</p>
    <div className={styles.grid}>
      <div><span className={styles.muted}>Plan balance</span><strong className={styles.amount}>{money(planPayments.balanceAmount)}</strong></div>
      <div><span className={styles.muted}>Pending requests</span><strong className={styles.amount}>{money(planPayments.pendingWithdrawalAmount)}</strong></div>
      <div><span className={styles.muted}>Available to withdraw</span><strong className={styles.amount}>{money(planPayments.availableWithdrawalAmount)}</strong></div>
    </div>
    <p className={styles.muted}>Withdrawals use your remaining balance after purchases. Sell holdings to make their value available as cash. Pending requests reserve funds until an admin sends or rejects them.</p>
    {planPayments.availableWithdrawalAmount <= 0 && <p className={styles.notice}>No funds are available for a new withdrawal. <Link href="/plans">View your plan payments</Link>.</p>}
    {paymentSyncError && <p role="status" className={styles.error}>Unable to refresh your balance. The amount will be checked again when you submit.</p>}
    <form action={action} className={styles.form} noValidate>
      <input type="hidden" name="id" value={requestId} />
      <label className={styles.field} htmlFor="withdrawal-amount">Exact amount (USD)
        <input id="withdrawal-amount" name="amount" type="text" inputMode="decimal" required placeholder="0.00" defaultValue={state.values?.amount ?? ""} maxLength={15} aria-invalid={!!state.errors?.amount} aria-describedby={state.errors?.amount ? "withdrawal-amount-error" : undefined} />
        {state.errors?.amount && <small id="withdrawal-amount-error" className={styles.error}>{state.errors.amount.join(" ")}</small>}
      </label>
      <div className={styles.grid}>
        {fields.map(field => <label className={styles.field} key={field.name} htmlFor={`withdrawal-${field.name}`}>
          {field.label}
          {field.multiline ? <textarea id={`withdrawal-${field.name}`} name={field.name} required maxLength={field.max} placeholder={field.placeholder} defaultValue={state.values?.[field.name] ?? ""} aria-invalid={!!state.errors?.[field.name]} aria-describedby={state.errors?.[field.name] ? `${field.name}-error` : undefined} /> :
            <input id={`withdrawal-${field.name}`} name={field.name} required type="text" inputMode={field.pattern ? "numeric" : "text"} pattern={field.pattern} autoComplete="off" maxLength={field.max} placeholder={field.placeholder} defaultValue={state.values?.[field.name] ?? ""} aria-invalid={!!state.errors?.[field.name]} aria-describedby={state.errors?.[field.name] ? `${field.name}-error` : undefined} />}
          {state.errors?.[field.name] && <small id={`${field.name}-error`} className={styles.error}>{state.errors[field.name].join(" ")}</small>}
        </label>)}
      </div>
      {state.message && <p role="alert" className={styles.error}>{state.message}</p>}
      <button type="submit" className={styles.button} disabled={pending || planPayments.availableWithdrawalAmount <= 0}>{pending ? "Submitting request…" : "Submit withdrawal request"}</button>
    </form>
  </div>;
}
