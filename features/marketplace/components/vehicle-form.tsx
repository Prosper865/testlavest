"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { MAX_UPLOAD_MB } from "@/lib/uploads";
import planStyles from "@/features/plans/components/plan-admin.module.css";
import { saveVehicle } from "../actions";
import type { Vehicle } from "../vehicles";
import styles from "./vehicle-admin.module.css";

type Field = { name: keyof Vehicle; label: string; hint?: string; placeholder?: string; type?: string; step?: string; min?: number };

const fields: Field[] = [
  { name: "model", label: "Model", placeholder: "e.g. Model Y" },
  { name: "trim", label: "Trim", placeholder: "e.g. Long Range AWD" },
  { name: "year", label: "Year", type: "number", placeholder: "2025", min: 2008 },
  { name: "price", label: "Price (USD)", type: "number", placeholder: "49990", min: 1 },
  { name: "rangeMiles", label: "Estimated range (miles)", type: "number", placeholder: "327", min: 1 },
  { name: "zeroToSixty", label: "0–60 mph (seconds)", type: "number", step: "0.1", placeholder: "4.6", min: 1 },
  { name: "mileage", label: "Odometer (miles)", type: "number", placeholder: "Pre-owned only", hint: "Leave empty for new cars.", min: 0 },
  { name: "color", label: "Colour name", placeholder: "e.g. Ultra Red" },
  { name: "highlight", label: "Highlight", placeholder: "e.g. Inspected, single owner" },
];

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, action, pending] = useActionState(saveVehicle, undefined);
  const submitted = state?.values;
  const value = (name: keyof Vehicle) => {
    if (submitted) return submitted[name] ?? "";
    const current = vehicle?.[name];
    return current === null || current === undefined ? "" : String(current);
  };
  const error = (name: string) => state?.errors?.[name]?.[0];

  const [imageUrl, setImageUrl] = useState(value("imageUrl"));
  const [filePreview, setFilePreview] = useState<string | null>(null);
  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);
  const preview = filePreview ?? (imageUrl.startsWith("https://") ? imageUrl : null);

  return (
    <form action={action} className={planStyles.form} noValidate>
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      {state?.message && <p className={planStyles.alert} role="alert">{state.message}</p>}

      <div className={styles.photoRow}>
        <div className={styles.photoPreview} style={{ background: value("swatch") || "#2a1318" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- previews can be local files or any https host */}
          {preview ? <img src={preview} alt="Car photo preview" /> : <span>No photo yet</span>}
        </div>
        <div className={planStyles.grid}>
          <label className={planStyles.full}>
            <span>Upload photo</span>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              aria-invalid={error("image") ? true : undefined}
              onChange={event => {
                const file = event.target.files?.[0];
                setFilePreview(file ? URL.createObjectURL(file) : null);
              }}
            />
            {error("image") ? <small className={planStyles.error}>{error("image")}</small> : <small>JPG, PNG, WebP or AVIF, up to {MAX_UPLOAD_MB} MB. A wide (landscape) photo looks best.</small>}
          </label>
          <label className={planStyles.full}>
            <span>Or image link</span>
            <input name="imageUrl" type="url" value={imageUrl} onChange={event => setImageUrl(event.target.value)} placeholder="https://…" aria-invalid={error("imageUrl") ? true : undefined} />
            {error("imageUrl") ? <small className={planStyles.error}>{error("imageUrl")}</small> : <small>An uploaded photo replaces this link. Clear it to remove the photo.</small>}
          </label>
        </div>
      </div>

      <div className={planStyles.grid}>
        {fields.map(field => (
          <label key={field.name} className={planStyles.half}>
            <span>{field.label}</span>
            <input name={field.name} type={field.type ?? "text"} step={field.step ?? (field.type === "number" ? "1" : undefined)} min={field.min} defaultValue={value(field.name)} placeholder={field.placeholder} aria-invalid={error(field.name) ? true : undefined} />
            {error(field.name) ? <small className={planStyles.error}>{error(field.name)}</small> : field.hint && <small>{field.hint}</small>}
          </label>
        ))}
        <label className={planStyles.half}>
          <span>Condition</span>
          <select name="condition" defaultValue={value("condition") || "New"}>
            <option value="New">New</option>
            <option value="Pre-owned">Pre-owned</option>
          </select>
        </label>
        <label className={planStyles.half}>
          <span>Paint colour</span>
          <input name="swatch" type="color" className={styles.swatch} defaultValue={value("swatch") || "#b3141f"} aria-invalid={error("swatch") ? true : undefined} />
          {error("swatch") ? <small className={planStyles.error}>{error("swatch")}</small> : <small>Used for the card artwork when there is no photo.</small>}
        </label>
        <div className={planStyles.toggles}>
          <label><input type="checkbox" name="visible" defaultChecked={submitted ? submitted.visible === "on" : vehicle?.visible ?? true} /> Show in marketplace</label>
        </div>
      </div>

      <div className={planStyles.actions}>
        <Link href="/admin/marketplace" className={planStyles.secondary}>Cancel</Link>
        <button type="submit" className={planStyles.primary} disabled={pending}>{pending ? "Saving…" : vehicle ? "Save changes" : "Add car"}</button>
      </div>
    </form>
  );
}
