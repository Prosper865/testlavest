"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deletePlan, movePlan, togglePlanVisibility } from "../actions";
import styles from "./plan-admin.module.css";

type Props = { id: string; name: string; visible: boolean; isFirst: boolean; isLast: boolean };

export function PlanRowActions({ id, name, visible, isFirst, isLast }: Props) {
  const [, moveAction, moving] = useActionState(movePlan, undefined);
  const [, toggleAction, toggling] = useActionState(togglePlanVisibility, undefined);
  const [deleteState, deleteAction, deleting] = useActionState(deletePlan, undefined);

  return (
    <div className={styles.rowActions}>
      <form action={moveAction} className={styles.order}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" name="direction" value="up" disabled={isFirst || moving} aria-label={`Move ${name} up`}>↑</button>
        <button type="submit" name="direction" value="down" disabled={isLast || moving} aria-label={`Move ${name} down`}>↓</button>
      </form>
      <form action={toggleAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={styles.switch} role="switch" aria-checked={visible} aria-label={`Show ${name} on website`} disabled={toggling}><i /></button>
      </form>
      <Link href={`/admin/plans/${id}`} className={styles.small}>Edit</Link>
      <form action={deleteAction} onSubmit={event => { if (!window.confirm(`Delete the ${name} plan? This can't be undone.`)) event.preventDefault(); }}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={styles.smallDanger} disabled={deleting}>Delete</button>
      </form>
      {deleteState?.message && !deleteState.ok && <small role="alert">{deleteState.message}</small>}
    </div>
  );
}
