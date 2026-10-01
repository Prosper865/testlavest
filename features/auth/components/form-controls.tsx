"use client";

import { useId, useState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import styles from "./auth.module.css";

type FieldProps = ComponentProps<"input"> & { label: string; errors?: string[]; hint?: string };

export function TextField({ label, errors, hint, ...input }: FieldProps) {
  const id = useId();
  const described = errors?.length ? `${id}-errors` : hint ? `${id}-hint` : undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={errors?.length ? true : undefined} aria-describedby={described} {...input} />
      {errors?.length ? <ul id={`${id}-errors`} className={styles.errors}>{errors.map(error => <li key={error}>{error}</li>)}</ul> : hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  );
}

export function PasswordField({ label, errors, hint, ...input }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const described = errors?.length ? `${id}-errors` : hint ? `${id}-hint` : undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.passwordWrap}>
        <input id={id} type={visible ? "text" : "password"} aria-invalid={errors?.length ? true : undefined} aria-describedby={described} {...input} />
        <button type="button" className={styles.reveal} aria-pressed={visible} aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button>
      </div>
      {errors?.length ? <ul id={`${id}-errors`} className={styles.errors}>{errors.map(error => <li key={error}>{error}</li>)}</ul> : hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  );
}

export function SubmitButton({ children, pendingText }: { children: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={styles.submit} disabled={pending} aria-busy={pending}>{pending ? pendingText : children}</button>;
}
