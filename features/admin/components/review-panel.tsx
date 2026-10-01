"use client";

import { useActionState, useState } from "react";
import { reviewKyc } from "../actions";
import { cn } from "@/lib/utils";
import styles from "./admin.module.css";

const reasons = ["Document is blurry or cropped", "Selfie doesn't match the ID", "Document has expired", "Name doesn't match the account", "Address could not be verified"];

/** Approve or reject a pending KYC submission. Rejections require a note the user will see. */
export function ReviewPanel({ submissionId }: { submissionId: string }) {
  const [state, action, pending] = useActionState(reviewKyc, undefined);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [note, setNote] = useState("");

  if (state?.ok) {
    return <p className={cn(styles.feedback, styles.success)} role="status">{state.message}</p>;
  }

  return (
    <form action={action}>
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className={styles.decision} role="radiogroup" aria-label="Decision">
        <label className={styles.approve}><input type="radio" name="decision" value="approved" checked={decision === "approved"} onChange={() => setDecision("approved")} />✓ Approve</label>
        <label className={styles.reject}><input type="radio" name="decision" value="rejected" checked={decision === "rejected"} onChange={() => setDecision("rejected")} />✕ Reject</label>
      </div>
      <label className={styles.noteLabel} htmlFor="review-note">{decision === "rejected" ? "Reason (shown to the user)" : "Internal note (optional)"}</label>
      <textarea id="review-note" name="note" className={styles.note} value={note} onChange={event => setNote(event.target.value)} maxLength={500} required={decision === "rejected"} placeholder={decision === "rejected" ? "Explain what the user needs to fix." : "Anything worth recording for this approval."} />
      {decision === "rejected" && (
        <div className={styles.presets} aria-label="Common reasons">
          {reasons.map(reason => <button key={reason} type="button" onClick={() => setNote(reason + ".")}>{reason}</button>)}
        </div>
      )}
      <button type="submit" className={styles.primaryBtn} disabled={pending}>{pending ? "Saving…" : decision === "approved" ? "Approve verification" : "Reject verification"}</button>
      {state?.message && <p className={cn(styles.feedback, styles.failure)} role="alert">{state.message}</p>}
    </form>
  );
}
