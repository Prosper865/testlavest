"use client";

import { EmptyState, Panel, PanelHeader } from "@/components/ui";
import { usePortfolio } from "@/features/portfolio/store";
import { formatDate, money } from "@/lib/format";
import { getVehicle, vehicleName } from "../vehicles";
import styles from "./marketplace.module.css";

export function ReservationsPanel() {
  const { reservations } = usePortfolio();
  return (
    <Panel aria-labelledby="reservations-heading">
      <PanelHeader title={<span id="reservations-heading">Your reservations</span>} />
      {reservations.length === 0 ? (
        <EmptyState>No vehicles reserved yet. Reserve one from the selection above with a refundable deposit.</EmptyState>
      ) : (
        <ul className={styles.reservations}>
          {reservations.map(item => {
            const vehicle = getVehicle(item.vehicleId);
            if (!vehicle) return null;
            return (
              <li key={item.vehicleId}>
                <div><b>{vehicleName(vehicle)}</b><small>Reserved {formatDate(item.time)} · {vehicle.color}</small></div>
                <span>Deposit {money(item.deposit)}</span>
                <span>Balance due {money(vehicle.price - item.deposit)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
