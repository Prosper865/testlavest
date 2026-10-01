"use client";

import { useActionState } from "react";
import { setUserRole, setUserStatus } from "../actions";
import { cn } from "@/lib/utils";
import styles from "./admin.module.css";

type Props = { userId: string; status: "active" | "suspended"; role: "user" | "admin"; name: string };

/** Suspend or reactivate an account, and grant or remove admin access. Confirms before acting. */
export function UserActions({ userId, status, role, name }: Props) {
  const [statusState, statusAction, statusPending] = useActionState(setUserStatus, undefined);
  const [roleState, roleAction, rolePending] = useActionState(setUserRole, undefined);
  const nextStatus = status === "active" ? "suspended" : "active";
  const nextRole = role === "admin" ? "user" : "admin";
  const feedback = statusState ?? roleState;

  const confirmFirst = (message: string) => (event: React.FormEvent) => {
    if (!window.confirm(message)) event.preventDefault();
  };

  return (
    <>
      <div className={styles.actionsRow}>
        <form action={statusAction} onSubmit={confirmFirst(nextStatus === "suspended" ? `Suspend ${name}? They will be signed out and can't log in until reactivated.` : `Reactivate ${name}'s account?`)}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="status" value={nextStatus} />
          <button type="submit" className={nextStatus === "suspended" ? styles.dangerBtn : styles.ghostBtn} disabled={statusPending}>{nextStatus === "suspended" ? "Suspend account" : "Reactivate account"}</button>
        </form>
        <form action={roleAction} onSubmit={confirmFirst(nextRole === "admin" ? `Give ${name} full admin access, including reviewing identities and managing users?` : `Remove admin access from ${name}?`)}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="role" value={nextRole} />
          <button type="submit" className={styles.ghostBtn} disabled={rolePending}>{nextRole === "admin" ? "Make admin" : "Remove admin"}</button>
        </form>
      </div>
      {feedback?.message && <p className={cn(styles.feedback, feedback.ok ? styles.success : styles.failure)} role="status">{feedback.message}</p>}
    </>
  );
}
