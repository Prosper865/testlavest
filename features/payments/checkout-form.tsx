"use client";

import { useActionState, useEffect, useState } from "react";
import type { InvestmentPlan } from "@/lib/db/schema";
import { money } from "@/lib/format";
import { submitOrderReceipt } from "./order-actions";
import { submitPlanReceipt } from "./plan-actions";
import type { PayMethod } from "./methods";
import styles from "./checkout.module.css";
import { MAX_UPLOAD_MB, uploadSizeError } from "@/lib/uploads";

type Kind = PayMethod["kind"];

const labels: Record<Kind, { tab: string; pick: string; proof: string }> = {
  wallet: { tab: "Crypto wallet", pick: "Choose a wallet", proof: "payment screenshot" },
  bank: { tab: "Bank transfer", pick: "Choose a bank account", proof: "proof of transfer" },
};

type Props = { methods: PayMethod[]; submissionId: string } & (
  | { plan: Pick<InvestmentPlan, "id" | "name" | "minInvestment" | "maxInvestment">; order?: undefined }
  /** Buying a car: the price is fixed, and the server reads it from the listing again. */
  | { order: { vehicleId: string; name: string; price: number }; plan?: undefined }
);

/** Pay by wallet or bank transfer and upload proof, for either an investment plan or a car order. */
export function CheckoutForm({ plan, order, methods, submissionId }: Props) {
  const [state, action, pending] = useActionState(order ? submitOrderReceipt : submitPlanReceipt, {});
  const kinds = (["wallet", "bank"] as const).filter(kind => methods.some(item => item.kind === kind));
  const [kind, setKind] = useState<Kind>(kinds[0] ?? "wallet");
  const options = methods.filter(item => item.kind === kind);
  const [selected, setSelected] = useState<Record<Kind, string>>({ wallet: "", bank: "" });
  const method = options.find(item => item.id === selected[kind]) ?? options[0];
  const [amount, setAmount] = useState(String(plan?.minInvestment ?? ""));
  const payAmount = order ? order.price : Number(amount) || 0;
  const [copyNotice, setCopyNotice] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  async function copy(text: string, what: string) {
    try { await navigator.clipboard.writeText(text); setCopyNotice(`${what} copied.`); }
    catch { setCopyNotice("Copy was unavailable. Select the text above and copy it manually."); }
  }

  if (!methods.length) return <p className={styles.notice}>No payment methods are set up yet. Please check back once an admin adds a wallet or bank account.</p>;

  const text = labels[kind];
  // Number the steps from 1 whether or not the payment type step is shown.
  const step = (n: number) => `${n + (kinds.length > 1 ? 1 : 0)}.`;
  return <form action={action} className={styles.form}>
    <input type="hidden" name="id" value={submissionId} />
    {order ? <input type="hidden" name="vehicleId" value={order.vehicleId} /> : <input type="hidden" name="planId" value={plan.id} />}
    <input type="hidden" name="methodId" value={method?.id ?? ""} />
    <input type="hidden" name="address" value={method?.address ?? ""} />
    <p className={styles.notice}>Pay using the details below and upload your {text.proof} for admin review. {order ? "Your order is confirmed after approval." : "Your balance updates after approval."}</p>
    {order ? <div className={styles.orderTotal}><span>{order.name}</span><b>{money(order.price)}</b></div> : <label className={styles.field}>Plan amount (USD)
      <input type="number" name="amount" required min={plan.minInvestment} max={plan.maxInvestment ?? 100_000_000} step="1" value={amount} onChange={event => setAmount(event.target.value)} />
      <small className={styles.muted}>Minimum {money(plan.minInvestment)}{plan.maxInvestment !== null ? ` · Maximum ${money(plan.maxInvestment)}` : ""}</small>
    </label>}

    {kinds.length > 1 && <fieldset disabled={pending}>
      <legend>1. How would you like to pay?</legend>
      <div className={styles.kinds} role="radiogroup" aria-label="Payment type">
        {kinds.map(item => <label className={styles.kind} key={item}>
          <input type="radio" name="kind" value={item} checked={kind === item} onChange={() => { setKind(item); setCopyNotice(""); }} />
          <span><b>{labels[item].tab}</b><small>{item === "wallet" ? "Send crypto to our wallet address" : "Send a transfer from your bank"}</small></span>
        </label>)}
      </div>
    </fieldset>}

    <fieldset disabled={pending}>
      <legend>{step(1)} {text.pick}</legend>
      {options.map(item => <label className={styles.wallet} key={item.id}>
        <input type="radio" name="choice" value={item.id} checked={method?.id === item.id} onChange={() => { setSelected(current => ({ ...current, [kind]: item.id })); setCopyNotice(""); }} required />
        <span><b>{item.name}</b><small>{item.network}</small></span>
      </label>)}
    </fieldset>

    {method?.kind === "wallet" && <div><b>{step(2)} Copy the address · {method.network}</b><code className={styles.address}>{method.address}</code>
      <button type="button" className={styles.secondary} onClick={() => copy(method.address, "Address")}>Copy address</button>
      {copyNotice && <p role="status" className={styles.muted}>{copyNotice}</p>}
    </div>}

    {method?.kind === "bank" && <div><b>{step(2)} Transfer to this account · {method.name}</b>
      <dl className={styles.bankDetails}>
        <div><dt>Bank</dt><dd>{method.name}</dd></div>
        <div><dt>Account name</dt><dd>{method.accountName}</dd></div>
        <div><dt>Account number</dt><dd>{method.address}<button type="button" className={styles.copyLink} onClick={() => copy(method.address, "Account number")}>Copy</button></dd></div>
        {method.routingNumber && <div><dt>Routing / sort code</dt><dd>{method.routingNumber}<button type="button" className={styles.copyLink} onClick={() => copy(method.routingNumber ?? "", "Routing number")}>Copy</button></dd></div>}
        <div><dt>Amount to send</dt><dd>{money(payAmount)}</dd></div>
      </dl>
      {method.instructions && <p className={styles.notice}>{method.instructions}</p>}
      {copyNotice && <p role="status" className={styles.muted}>{copyNotice}</p>}
    </div>}

    <label className={styles.field}>{step(3)} Upload {text.proof}
      <input type="file" name="screenshot" accept="image/png,image/jpeg,image/webp" required disabled={pending} onChange={event => {
        const file = event.target.files?.[0];
        const tooLarge = uploadSizeError(file, "Screenshot");
        // Nothing is uploaded here: the file stays in the form until it is submitted.
        event.target.setCustomValidity(tooLarge ?? "");
        if (tooLarge) { event.target.reportValidity(); event.target.value = ""; }
        setPreview(file && !tooLarge ? URL.createObjectURL(file) : "");
      }} />
      <small className={styles.muted}>PNG, JPG, or WebP · up to {MAX_UPLOAD_MB} MB. Only you and admins can view your upload.</small>
    </label>
    {/* A local object URL previews the exact file selected by the user. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {preview && <img src={preview} alt="Selected payment proof" className={styles.preview} />}
    {state.message && <p role="alert" className={styles.error}>{state.message} Please reselect the file before retrying.</p>}
    <button type="submit" className={styles.button} disabled={pending || !method}>{pending ? "Submitting…" : order ? "Place order" : "Submit for review"}</button>
  </form>;
}
