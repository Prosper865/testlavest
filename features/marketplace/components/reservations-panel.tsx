"use client";

import { useState } from "react";
import { Button, Panel, PanelHeader, StatusMessage } from "@/components/ui";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { formatDate, money } from "@/lib/format";
import { vehicleName } from "../vehicles";
import { useVehicles } from "./vehicles-provider";
import styles from "./marketplace.module.css";

/**
 * Reservations can no longer be made (cars are bought through checkout), but anyone who reserved
 * one earlier keeps a refundable deposit. This panel only appears for them, so they can cancel.
 */
export function ReservationsPanel() {
  const { reservations } = usePortfolio();
  const { get } = useVehicles();
  const [notice, setNotice] = useState("");
  if (reservations.length === 0 && !notice) return null;
  return (
    <Panel aria-labelledby="reservations-heading">
      <PanelHeader title={<span id="reservations-heading">Earlier reservations</span>} />
      <p className="muted">Reservations are no longer offered. Cancel yours to get the deposit back, then buy the car from the list above.</p>
      <ul className={styles.reservations}>
        {reservations.map(item => {
          const vehicle = get(item.vehicleId);
          return (
            <li key={item.vehicleId}>
              <div><b>{vehicle ? vehicleName(vehicle) : "Removed listing"}</b><small>Reserved {formatDate(item.time)}{vehicle ? ` · ${vehicle.color}` : ""}</small></div>
              <span>Deposit {money(item.deposit)}</span>
              <Button size="sm" variant="outline" onClick={async () => setNotice((await portfolioActions.cancelReservation(item.vehicleId)).message)}>Cancel and refund</Button>
            </li>
          );
        })}
      </ul>
      <StatusMessage>{notice}</StatusMessage>
    </Panel>
  );
}
