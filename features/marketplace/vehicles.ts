// Curated EV listings. Prices and specifications are illustrative; confirm with the seller before purchase.
// Tesla is a trademark of Tesla, Inc. Listings do not imply affiliation or endorsement.

export type Condition = "New" | "Pre-owned";

export type Vehicle = {
  id: string;
  model: string;
  trim: string;
  year: number;
  condition: Condition;
  price: number;
  rangeMiles: number;
  zeroToSixty: number;
  mileage?: number;
  color: string;
  /** Paint swatch used for the card artwork. */
  swatch: string;
  highlight: string;
};

export const RESERVATION_DEPOSIT = 1000;

export const vehicles: Vehicle[] = [
  { id: "model-3-lr", model: "Model 3", trim: "Long Range AWD", year: 2025, condition: "New", price: 47490, rangeMiles: 346, zeroToSixty: 4.2, color: "Pearl White", swatch: "#e9e6e2", highlight: "Efficient everyday sedan" },
  { id: "model-y-lr", model: "Model Y", trim: "Long Range AWD", year: 2025, condition: "New", price: 49990, rangeMiles: 327, zeroToSixty: 4.6, color: "Ultra Red", swatch: "#b3141f", highlight: "Versatile midsize SUV" },
  { id: "model-s", model: "Model S", trim: "Dual Motor AWD", year: 2025, condition: "New", price: 79990, rangeMiles: 405, zeroToSixty: 3.1, color: "Stealth Grey", swatch: "#5a5d62", highlight: "Long-range flagship sedan" },
  { id: "model-x", model: "Model X", trim: "Dual Motor AWD", year: 2025, condition: "New", price: 84990, rangeMiles: 352, zeroToSixty: 3.8, color: "Deep Blue", swatch: "#1f3558", highlight: "Seven-seat family SUV" },
  { id: "cybertruck", model: "Cybertruck", trim: "All-Wheel Drive", year: 2025, condition: "New", price: 79990, rangeMiles: 325, zeroToSixty: 4.1, color: "Stainless Steel", swatch: "#a9adb1", highlight: "Stainless-steel pickup" },
  { id: "model-3-2022", model: "Model 3", trim: "Rear-Wheel Drive", year: 2022, condition: "Pre-owned", price: 26900, rangeMiles: 272, zeroToSixty: 5.8, mileage: 28400, color: "Midnight Silver", swatch: "#4b4f55", highlight: "Inspected, single owner" },
  { id: "model-y-2021", model: "Model Y", trim: "Long Range AWD", year: 2021, condition: "Pre-owned", price: 31500, rangeMiles: 318, zeroToSixty: 4.8, mileage: 41200, color: "Solid Black", swatch: "#1d1d1f", highlight: "Inspected, tow package" },
  { id: "model-s-2020", model: "Model S", trim: "Long Range Plus", year: 2020, condition: "Pre-owned", price: 42800, rangeMiles: 402, zeroToSixty: 3.7, mileage: 52600, color: "Pearl White", swatch: "#e9e6e2", highlight: "Inspected, premium interior" },
];

export function getVehicle(id: string) {
  return vehicles.find(vehicle => vehicle.id === id);
}

export function vehicleName(vehicle: Vehicle) {
  return `${vehicle.year} ${vehicle.model} ${vehicle.trim}`;
}
