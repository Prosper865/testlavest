"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { submitKyc } from "../actions";
import { ACCEPTED_UPLOADS, countries, documentTypes, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, sourcesOfFunds } from "../constants";
import type { KycField } from "../schemas";
import styles from "./kyc.module.css";

type Values = Record<Exclude<KycField, "documentFile" | "selfieFile" | "consent">, string>;

const steps = [
  { title: "Personal details", fields: ["legalName", "dateOfBirth", "nationality", "phone", "occupation"] },
  { title: "Address", fields: ["addressLine", "city", "postalCode", "country", "sourceOfFunds"] },
  { title: "Identity document", fields: ["documentType", "documentNumber", "documentFile", "selfieFile"] },
  { title: "Review & submit", fields: ["consent"] },
] as const;

const empty: Values = {
  legalName: "", dateOfBirth: "", nationality: "", phone: "", occupation: "",
  addressLine: "", city: "", postalCode: "", country: "", sourceOfFunds: "",
  documentType: "passport", documentNumber: "",
};

function FileDrop({ label, hint, file, onChange, error }: { label: string; hint: string; file: File | null; onChange: (file: File | null) => void; error?: string[] }) {
  const preview = useMemo(() => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div className={cn(styles.field, styles.upload, styles.full)}>
      <label>{label}</label>
      <div className={styles.drop}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
        {file && preview ? <img src={preview} alt="" /> : <span className={styles.dropIcon} aria-hidden="true">{file ? "📄" : "↑"}</span>}
        <div>
          <b>{file ? file.name : "Choose a file or drag it here"}</b>
          <small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : hint}</small>
        </div>
        <input type="file" accept={ACCEPTED_UPLOADS} aria-label={label} aria-invalid={error ? true : undefined} onChange={event => onChange(event.target.files?.[0] ?? null)} />
      </div>
      {error && <p className={styles.error}>{error[0]}</p>}
    </div>
  );
}

export function KycWizard({ defaultName, rejectedNote }: { defaultName: string; rejectedNote?: string | null }) {
  const [state, action, pending] = useActionState(submitKyc, undefined);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({ ...empty, legalName: defaultName });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [localErrors, setLocalErrors] = useState<Partial<Record<KycField, string[]>>>({});
  const card = useRef<HTMLDivElement>(null);
  const errors = { ...state?.errors, ...localErrors };

  // When a new server response has errors, jump to the first step that has one.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    const index = steps.findIndex(item => item.fields.some(name => state?.errors?.[name as KycField]));
    if (index >= 0) setStep(index);
  }

  const set = (field: keyof Values) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues(current => ({ ...current, [field]: event.target.value }));
    setLocalErrors(current => ({ ...current, [field]: undefined }));
  };

  function go(next: number) {
    setStep(next);
    card.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateStep() {
    const missing: Partial<Record<KycField, string[]>> = {};
    for (const field of steps[step].fields) {
      if (field === "documentFile" && !documentFile) missing.documentFile = ["Upload your ID document."];
      else if (field === "selfieFile" && !selfieFile) missing.selfieFile = ["Upload a selfie."];
      else if (field === "consent" && !consent) missing.consent = ["Please confirm the information is accurate."];
      else if (field in values && !values[field as keyof Values].trim()) missing[field] = ["This field is required."];
    }
    for (const [field, file] of [["documentFile", documentFile], ["selfieFile", selfieFile]] as const) {
      if (file && file.size > MAX_UPLOAD_BYTES && steps[step].fields.includes(field as never)) missing[field] = [`Files must be ${MAX_UPLOAD_MB} MB or smaller.`];
    }
    setLocalErrors(missing);
    return Object.keys(missing).length === 0;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateStep()) return;
    if (step < steps.length - 1) return go(step + 1);
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.set(key, value));
    if (documentFile) data.set("documentFile", documentFile);
    if (selfieFile) data.set("selfieFile", selfieFile);
    if (consent) data.set("consent", "on");
    startTransition(() => action(data));
  }

  const field = (name: keyof Values, label: string, input: ReactNode, options: { full?: boolean; hint?: string } = {}) => (
    <div className={cn(styles.field, options.full && styles.full)}>
      <label htmlFor={`kyc-${name}`}>{label}</label>
      {input}
      {errors[name] ? <p className={styles.error}>{errors[name]![0]}</p> : options.hint && <p className={styles.hint}>{options.hint}</p>}
    </div>
  );
  const text = (name: keyof Values, props: React.ComponentProps<"input"> = {}) => (
    <input id={`kyc-${name}`} value={values[name]} onChange={set(name)} aria-invalid={errors[name] ? true : undefined} {...props} />
  );
  const select = (name: keyof Values, options: readonly string[], placeholder: string) => (
    <select id={`kyc-${name}`} value={values[name]} onChange={set(name)} aria-invalid={errors[name] ? true : undefined}>
      <option value="" disabled>{placeholder}</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  );
  const docLabel = documentTypes.find(item => item.value === values.documentType)?.label ?? "Document";

  return (
    <div className={styles.wizard}>
      <ol className={styles.steps} aria-label="Verification steps">
        {steps.map((item, index) => (
          <li key={item.title} className={cn(styles.step, index < step && styles.done)} aria-current={index === step ? "step" : undefined}>
            <span aria-hidden="true">{index < step ? "✓" : index + 1}</span>{item.title}
          </li>
        ))}
      </ol>

      <div ref={card} className={styles.card}>
        {rejectedNote && step === 0 && <p className={styles.alert}>Your previous submission was not approved: {rejectedNote}</p>}
        <form onSubmit={submit} noValidate>
          {step === 0 && (
            <>
              <h2>Tell us about yourself</h2>
              <p>Use the details exactly as they appear on your ID.</p>
              <div className={styles.grid}>
                {field("legalName", "Full legal name", text("legalName", { autoComplete: "name" }), { full: true })}
                {field("dateOfBirth", "Date of birth", text("dateOfBirth", { type: "date", autoComplete: "bday" }), { hint: "You must be 18 or older." })}
                {field("nationality", "Nationality", select("nationality", countries, "Select a country"))}
                {field("phone", "Phone number", text("phone", { type: "tel", autoComplete: "tel", placeholder: "+1 555 123 4567" }))}
                {field("occupation", "Occupation", text("occupation", { placeholder: "e.g. Software engineer" }))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>Where do you live?</h2>
              <p>We need your residential address and where your investment money comes from.</p>
              <div className={styles.grid}>
                {field("addressLine", "Street address", text("addressLine", { autoComplete: "street-address" }), { full: true })}
                {field("city", "City", text("city", { autoComplete: "address-level2" }))}
                {field("postalCode", "Postal code", text("postalCode", { autoComplete: "postal-code" }))}
                {field("country", "Country of residence", select("country", countries, "Select a country"))}
                {field("sourceOfFunds", "Source of funds", select("sourceOfFunds", sourcesOfFunds, "Select a source"))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Verify your identity</h2>
              <p>Upload a clear photo of a government-issued ID and a selfie. JPG, PNG, WebP, or PDF, up to 5 MB each.</p>
              <div className={styles.grid}>
                {field("documentType", "Document type", (
                  <select id="kyc-documentType" value={values.documentType} onChange={set("documentType")}>
                    {documentTypes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                ))}
                {field("documentNumber", "Document number", text("documentNumber", { autoComplete: "off", spellCheck: false }), { hint: "Only the last 4 characters are stored." })}
                <FileDrop label={`${docLabel} (photo page or front)`} hint="Make sure all corners and text are visible." file={documentFile} onChange={file => { setDocumentFile(file); setLocalErrors(current => ({ ...current, documentFile: undefined })); }} error={errors.documentFile} />
                <FileDrop label="Selfie" hint="A clear photo of your face, without sunglasses or hats." file={selfieFile} onChange={file => { setSelfieFile(file); setLocalErrors(current => ({ ...current, selfieFile: undefined })); }} error={errors.selfieFile} />
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Review and submit</h2>
              <p>Check your details. Our team usually reviews submissions within one business day.</p>
              <div className={styles.review}>
                {[
                  { title: "Personal details", step: 0, rows: [["Legal name", values.legalName], ["Date of birth", values.dateOfBirth], ["Nationality", values.nationality], ["Phone", values.phone], ["Occupation", values.occupation]] },
                  { title: "Address", step: 1, rows: [["Address", `${values.addressLine}, ${values.city} ${values.postalCode}`], ["Country", values.country], ["Source of funds", values.sourceOfFunds]] },
                  { title: "Identity document", step: 2, rows: [["Document", `${docLabel} ending ${values.documentNumber.slice(-4).toUpperCase()}`], ["ID upload", documentFile?.name ?? "—"], ["Selfie", selfieFile?.name ?? "—"]] },
                ].map(group => (
                  <section key={group.title} className={styles.reviewGroup}>
                    <h3>{group.title}<button type="button" onClick={() => go(group.step)}>Edit</button></h3>
                    <dl>{group.rows.map(([term, detail]) => <div key={term} className={styles.row}><dt>{term}</dt><dd>{detail || "—"}</dd></div>)}</dl>
                  </section>
                ))}
              </div>
              <label className={styles.consent}>
                <input type="checkbox" checked={consent} onChange={event => { setConsent(event.target.checked); setLocalErrors(current => ({ ...current, consent: undefined })); }} />
                <span>I confirm this information is accurate and consent to it being reviewed for identity verification. (Simulated: no data leaves this platform.)</span>
              </label>
              {errors.consent && <p className={styles.error}>{errors.consent[0]}</p>}
            </>
          )}

          {state?.message && <p role="alert" className={styles.alert}>{state.message}</p>}
          <div className={styles.actions}>
            {step > 0 && <button type="button" className={styles.secondary} onClick={() => go(step - 1)}>Back</button>}
            <button type="submit" className={styles.primary} disabled={pending}>
              {step < steps.length - 1 ? "Continue" : pending ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
