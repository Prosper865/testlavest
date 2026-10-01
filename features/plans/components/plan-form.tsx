"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { InvestmentPlan } from "@/lib/db/schema";
import { savePlan } from "../actions";
import styles from "./plan-admin.module.css";

type Field = { name: keyof InvestmentPlan; label: string; hint?: string; placeholder?: string; type?: string; half?: boolean };

const fields: Field[] = [
  { name: "name", label: "Plan name", placeholder: "e.g. Growth", half: true },
  { name: "tagline", label: "Short description", placeholder: "One sentence shown under the name", half: true },
  { name: "minInvestment", label: "Minimum investment (USD)", type: "number", placeholder: "5000", half: true },
  { name: "maxInvestment", label: "Maximum investment (USD)", type: "number", placeholder: "Leave empty for no maximum", half: true },
  { name: "duration", label: "Duration", placeholder: "e.g. 12 months recommended", half: true },
  { name: "withdrawals", label: "Withdrawals", placeholder: "e.g. Monthly, Anytime", half: true },
  { name: "expectedReturn", label: "Estimated return", placeholder: "e.g. 6–9%", half: true },
  { name: "fee", label: "Fee", placeholder: "e.g. 0.40% a year", half: true },
];

export function PlanForm({ plan }: { plan?: InvestmentPlan }) {
  const [state, action, pending] = useActionState(savePlan, undefined);
  const submitted = state?.values;
  const value = (name: keyof InvestmentPlan) => {
    if (submitted) return submitted[name] ?? "";
    const current = plan?.[name];
    return current === null || current === undefined ? "" : String(current);
  };
  const checked = (name: "visible" | "featured", fallback: boolean) => (submitted ? submitted[name] === "on" : plan?.[name] ?? fallback);

  return (
    <form action={action} className={styles.form} noValidate>
      {plan && <input type="hidden" name="id" value={plan.id} />}
      {state?.message && <p className={styles.alert} role="alert">{state.message}</p>}
      <div className={styles.grid}>
        {fields.map(field => (
          <label key={field.name} className={field.half ? styles.half : styles.full}>
            <span>{field.label}</span>
            <input name={field.name} type={field.type ?? "text"} min={field.type === "number" ? 1 : undefined} step={field.type === "number" ? 1 : undefined} defaultValue={value(field.name)} placeholder={field.placeholder} aria-invalid={state?.errors?.[field.name] ? true : undefined} />
            {state?.errors?.[field.name] ? <small className={styles.error}>{state.errors[field.name]![0]}</small> : field.hint && <small>{field.hint}</small>}
          </label>
        ))}
        <label className={styles.half}>
          <span>Risk level</span>
          <select name="riskLevel" defaultValue={submitted?.riskLevel ?? plan?.riskLevel ?? "moderate"}>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className={styles.full}>
          <span>Features</span>
          <textarea name="features" rows={5} defaultValue={submitted?.features ?? plan?.features.join("\n")} placeholder={"One feature per line, e.g.\nAutomatic rebalancing\nQuarterly reports"} aria-invalid={state?.errors?.features ? true : undefined} />
          {state?.errors?.features ? <small className={styles.error}>{state.errors.features[0]}</small> : <small>One per line, up to 8.</small>}
        </label>
        <div className={styles.toggles}>
          <label><input type="checkbox" name="visible" defaultChecked={checked("visible", true)} /> Show on website</label>
          <label><input type="checkbox" name="featured" defaultChecked={checked("featured", false)} /> Highlight as “Most popular”</label>
        </div>
      </div>
      <div className={styles.actions}>
        <Link href="/admin/plans" className={styles.secondary}>Cancel</Link>
        <button type="submit" className={styles.primary} disabled={pending}>{pending ? "Saving…" : plan ? "Save changes" : "Create plan"}</button>
      </div>
    </form>
  );
}
