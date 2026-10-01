"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "../actions";
import styles from "./auth.module.css";
import { PasswordField, SubmitButton, TextField } from "./form-controls";

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signup, undefined);
  return (
    <>
      <h1>Create your account</h1>
      <p className={styles.lead}>It takes a minute. You&apos;ll verify your identity next to unlock trading.</p>
      <form action={action} className={styles.form} noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        {state?.message && <p role="alert" className={styles.alert}>{state.message}</p>}
        <TextField label="Full name" name="name" autoComplete="name" required defaultValue={state?.values?.name} errors={state?.errors?.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state?.values?.email} errors={state?.errors?.email} />
        <PasswordField label="Password" name="password" autoComplete="new-password" required errors={state?.errors?.password} hint="8+ characters with a letter, a number, and a symbol." />
        <div>
          <label className={styles.check}>
            <input type="checkbox" name="terms" required />
            <span>I agree to the Terms of Service and Privacy Policy, and understand this is a preview using funds.</span>
          </label>
          {state?.errors?.terms && <ul className={styles.errors}>{state.errors.terms.map(error => <li key={error}>{error}</li>)}</ul>}
        </div>
        <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      </form>
      <p className={styles.switch}>Already have an account? <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Log in</Link></p>
    </>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <>
      <h1>Welcome back</h1>
      <p className={styles.lead}>Log in to your account to continue.</p>
      <form action={action} className={styles.form} noValidate>
        {state?.message && <p role="alert" className={styles.alert}>{state.message}</p>}
        {next && <input type="hidden" name="next" value={next} />}
        <TextField label="Email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state?.values?.email} errors={state?.errors?.email} />
        <PasswordField label="Password" name="password" autoComplete="current-password" required errors={state?.errors?.password} />
        <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
      </form>
      <p className={styles.switch}>New here? <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>Create an account</Link></p>
    </>
  );
}
