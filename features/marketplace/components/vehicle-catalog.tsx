"use client";

import { useState } from "react";
import { ButtonLink, EmptyState, SegmentedControl } from "@/components/ui";
import { money } from "@/lib/format";
import type { Condition } from "../vehicles";
import { VehicleCard } from "./vehicle-card";
import { useVehicles } from "./vehicles-provider";
import styles from "./marketplace.module.css";
import { Icon } from "@/components/ui";

const conditions = ["All", "New", "Pre-owned"] as const;
type Sort = "featured" | "price-asc" | "price-desc" | "range";

export function VehicleCatalog({ onSaveFor }: { onSaveFor?: (vehicleId: string) => void }) {
  const [condition, setCondition] = useState<"All" | Condition>("All");
  const [sort, setSort] = useState<Sort>("featured");
  const { listed } = useVehicles();

  const list = listed
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
      {list.length === 0 && <EmptyState>No cars are listed right now. Check back soon.</EmptyState>}
      <div className={styles.grid}>
        {list.map(vehicle => (
          <VehicleCard key={vehicle.id} vehicle={vehicle}>
            <ButtonLink size="sm" block href={`/marketplace/${vehicle.id}/order`} arrow="arrow-up-right">Buy · {money(vehicle.price)}</ButtonLink>
            {onSaveFor && (
              <button type="button" className={styles.saveButton} onClick={() => onSaveFor(vehicle.id)}>Not ready yet? Save for this car <Icon name="arrow-right" /></button>
            )}
          </VehicleCard>
        ))}
      </div>
      <p className={styles.disclaimer}>Illustrative prices and specifications for a curated selection. Orders are confirmed after your payment is reviewed. Tesla is a trademark of Tesla, Inc.; no affiliation or endorsement is implied.</p>
    </>
  );
}
