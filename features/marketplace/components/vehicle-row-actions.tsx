"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/components/ui";
import styles from "@/features/plans/components/plan-admin.module.css";
import { deleteVehicle, moveVehicle, toggleVehicleVisibility } from "../actions";

type Props = { id: string; name: string; visible: boolean; isFirst: boolean; isLast: boolean };

export function VehicleRowActions({ id, name, visible, isFirst, isLast }: Props) {
  const [, moveAction, moving] = useActionState(moveVehicle, undefined);
  const [, toggleAction, toggling] = useActionState(toggleVehicleVisibility, undefined);
  const [deleteState, deleteAction, deleting] = useActionState(deleteVehicle, undefined);

  return (
    <div className={styles.rowActions}>
      <form action={moveAction} className={styles.order}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" name="direction" value="up" disabled={isFirst || moving} aria-label={`Move ${name} up`}><Icon name="arrow-up" /></button>
        <button type="submit" name="direction" value="down" disabled={isLast || moving} aria-label={`Move ${name} down`}><Icon name="arrow-down" /></button>
      </form>
      <form action={toggleAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={styles.switch} role="switch" aria-checked={visible} aria-label={`Show ${name} in marketplace`} disabled={toggling}><i /></button>
      </form>
      <Link href={`/admin/marketplace/${id}`} className={styles.small}>Edit</Link>
      <form action={deleteAction} onSubmit={event => { if (!window.confirm(`Delete the ${name} listing? This can't be undone. To take it down temporarily, switch it off instead.`)) event.preventDefault(); }}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={styles.smallDanger} disabled={deleting}>Delete</button>
      </form>
      {deleteState?.message && !deleteState.ok && <small role="alert">{deleteState.message}</small>}
    </div>
  );
}
