// Marketplace car listings live in the database (lib/db/schema.ts `vehicles`) and are managed by
// admins at /admin/marketplace. Prices and specifications are illustrative.
// Tesla is a trademark of Tesla, Inc. Listings do not imply affiliation or endorsement.
// Safe to import from client components.

import type { Vehicle, VehicleCondition } from "@/lib/db/schema";

export type { Vehicle };
export type Condition = VehicleCondition;

export function vehicleName(vehicle: Pick<Vehicle, "year" | "model" | "trim">) {
  return `${vehicle.year} ${vehicle.model} ${vehicle.trim}`;
}
