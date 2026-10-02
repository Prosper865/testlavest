"use client";

import { useActionState, useEffect, useState } from "react";
import type { InvestmentPlan, PaymentMethod } from "@/lib/db/schema";
import { money } from "@/lib/format";
import { submitPlanReceipt } from "./plan-actions";
import styles from "./checkout.module.css";
import { MAX_UPLOAD_MB, uploadSizeError } from "@/lib/uploads";

export function CheckoutForm({ plan, methods, submissionId }: {
  plan: Pick<InvestmentPlan, "id" | "name" | "minInvestment" | "maxInvestment">;
  methods: Pick<PaymentMethod, "id" | "name" | "network" | "address">[];
  submissionId: string;
}) {
  const [state, action, pending] = useActionState(submitPlanReceipt, {});
  const [methodId, setMethodId] = useState(methods[0]?.id ?? "");
  const [amount, setAmount] = useState(String(plan.minInvestment));
  const [copyNotice, setCopyNotice] = useState("");
  const [preview, setPreview] = useState("");
  const method = methods.find(item => item.id === methodId);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  async function copyAddress() {
    if (!method) return;
    try { await navigator.clipboard.writeText(method.address); setCopyNotice("Address copied."); }
    catch { setCopyNotice("Copy was unavailable. Select the address above and copy it manually."); }
  }

  if (!methods.length) return <p className={styles.notice}>No wallets are configured yet. Please check back once an admin adds a receiving address.</p>;

  return <form action={action} className={styles.form}>
    <input type="hidden" name="id" value={submissionId} />
    <input type="hidden" name="planId" value={plan.id} />
    <input type="hidden" name="address" value={method?.address ?? ""} />
    <p className={styles.notice}>Copy the receiving address and upload your payment screenshot for admin review. Your balance updates after approval.</p>
    <label className={styles.field}>Plan amount (USD)
      <input type="number" name="amount" required min={plan.minInvestment} max={plan.maxInvestment ?? 100_000_000} step="1" value={amount} onChange={event => setAmount(event.target.value)} />
      <small className={styles.muted}>Minimum {money(plan.minInvestment)}{plan.maxInvestment !== null ? ` · Maximum ${money(plan.maxInvestment)}` : ""}</small>
    </label>
    <fieldset disabled={pending}>
      <legend>1. Choose a wallet</legend>
      {methods.map(item => <label className={styles.wallet} key={item.id}>
        <input type="radio" name="methodId" value={item.id} checked={methodId === item.id} onChange={() => { setMethodId(item.id); setCopyNotice(""); }} required />
        <span><b>{item.name}</b><small>{item.network}</small></span>
      </label>)}
    </fieldset>
    {method && <div><b>2. Copy the address · {method.network}</b><code className={styles.address}>{method.address}</code>
      <button type="button" className={styles.secondary} onClick={copyAddress}>Copy address</button>
      {copyNotice && <p role="status" className={styles.muted}>{copyNotice}</p>}
    </div>}
    <label className={styles.field}>3. Upload a payment screenshot
      <input type="file" name="screenshot" accept="image/png,image/jpeg,image/webp" required disabled={pending} onChange={event => {
        const file = event.target.files?.[0];
        const tooLarge = uploadSizeError(file, "Screenshot");
        // Nothing is uploaded here: the file stays in the form until it is submitted.
        event.target.setCustomValidity(tooLarge ?? "");
        if (tooLarge) { event.target.reportValidity(); event.target.value = ""; }
        setPreview(file && !tooLarge ? URL.createObjectURL(file) : "");
      }} />
      <small className={styles.muted}>PNG, JPG, or WebP · up to {MAX_UPLOAD_MB} MB. Only you and admins can view your screenshot.</small>
    </label>
    {/* A local object URL previews the exact file selected by the user. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {preview && <img src={preview} alt="Selected payment screenshot" className={styles.preview} />}
    {state.message && <p role="alert" className={styles.error}>{state.message} Please reselect the screenshot before retrying.</p>}
    <button type="submit" className={styles.button} disabled={pending || !method}>{pending ? "Submitting screenshot…" : "Submit for review"}</button>
  </form>;
}
