"use client";

import { useState } from "react";
import { vehicles } from "../vehicles";
import { SavingsGoalPlanner, SavingsGoalsList } from "./savings-goals";
import { VehicleCatalog } from "./vehicle-catalog";
import styles from "./marketplace.module.css";

/** Catalogue plus savings planner: "Save for this car" preselects the vehicle in the planner. */
export function MarketplaceWorkspace() {
  const [goalVehicle, setGoalVehicle] = useState(vehicles[1].id);

  function saveFor(id: string) {
    setGoalVehicle(id);
    document.getElementById("save-for-tesla")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <VehicleCatalog onSaveFor={saveFor} />
      <div className={styles.goalsLayout}>
        <SavingsGoalPlanner vehicleId={goalVehicle} onVehicleChange={setGoalVehicle} />
        <SavingsGoalsList />
      </div>
    </>
  );
}
