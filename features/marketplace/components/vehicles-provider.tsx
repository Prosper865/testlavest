"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { Vehicle } from "../vehicles";

type VehiclesContext = {
  /** Listings shown in the marketplace, in admin order. */
  listed: Vehicle[];
  /** Looks up any listing, including hidden ones that existing reservations or goals refer to. */
  get: (id: string) => Vehicle | undefined;
};

const Context = createContext<VehiclesContext | null>(null);

/** Supplies the database listings (loaded by the page) to the marketplace components. */
export function VehiclesProvider({ vehicles, children }: { vehicles: Vehicle[]; children: ReactNode }) {
  const value = useMemo<VehiclesContext>(() => {
    const byId = new Map(vehicles.map(vehicle => [vehicle.id, vehicle]));
    return { listed: vehicles.filter(vehicle => vehicle.visible), get: id => byId.get(id) };
  }, [vehicles]);
  return <Context value={value}>{children}</Context>;
}

export function useVehicles() {
  const value = use(Context);
  if (!value) throw new Error("useVehicles must be used inside <VehiclesProvider>.");
  return value;
}
