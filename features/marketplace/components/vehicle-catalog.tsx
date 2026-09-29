"use client";

import { useState } from "react";
import { Button, SegmentedControl, StatusMessage } from "@/components/ui";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { money } from "@/lib/format";
import { RESERVATION_DEPOSIT, vehicleName, vehicles, type Condition } from "../vehicles";
import { VehicleCard } from "./vehicle-card";
import styles from "./marketplace.module.css";

const conditions = ["All", "New", "Pre-owned"] as const;
type Sort = "featured" | "price-asc" | "price-desc" | "range";

export function VehicleCatalog({ onSaveFor }: { onSaveFor?: (vehicleId: string) => void }) {
  const [condition, setCondition] = useState<"All" | Condition>("All");
  const [sort, setSort] = useState<Sort>("featured");
  const [notice, setNotice] = useState("");
  const { reservations } = usePortfolio();

  const list = vehicles
    .filter(vehicle => condition === "All" || vehicle.condition === condition)
    .toSorted((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "range" ? b.rangeMiles - a.rangeMiles : 0);

  return (
    <>
      <div className={styles.controls}>
        <SegmentedControl label="Vehicle condition" options={conditions} value={condition} onChange={setCondition} />
        <label className={styles.sort}>
          Sort by
          <select value={sort} onChange={event => setSort(event.target.value as Sort)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="range">Longest range</option>
          </select>
        </label>
      </div>
      <StatusMessage>{notice}</StatusMessage>
      <div className={styles.grid}>
        {list.map(vehicle => {
          const reserved = reservations.some(item => item.vehicleId === vehicle.id);
          return (
            <VehicleCard key={vehicle.id} vehicle={vehicle}>
              {reserved ? (
                <>
                  <p className={styles.reserved}>✓ Reserved with a {money(RESERVATION_DEPOSIT)} deposit</p>
                  <Button variant="outline" size="sm" block onClick={() => setNotice(portfolioActions.cancelReservation(vehicle.id, vehicleName(vehicle)).message)}>Cancel reservation</Button>
                </>
              ) : (
                <Button size="sm" block arrow="↗" onClick={() => setNotice(portfolioActions.reserveVehicle(vehicle.id, vehicleName(vehicle), RESERVATION_DEPOSIT).message)}>
                  Reserve · {money(RESERVATION_DEPOSIT)} refundable
                </Button>
              )}
              {onSaveFor && !reserved && (
                <button type="button" className={styles.saveButton} onClick={() => onSaveFor(vehicle.id)}>Not ready yet? Save for this car →</button>
              )}
            </VehicleCard>
          );
        })}
      </div>
      <p className={styles.disclaimer}>Illustrative prices and specifications for a curated selection. Reservations use virtual funds and are fully refundable in the demo. Tesla is a trademark of Tesla, Inc.; no affiliation or endorsement is implied.</p>
    </>
  );
}
