export const countries = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark",
  "Egypt", "Finland", "France", "Germany", "Ghana", "Greece", "India", "Indonesia", "Ireland", "Israel", "Italy",
  "Japan", "Kenya", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
  "Philippines", "Poland", "Portugal", "Qatar", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain",
  "Sweden", "Switzerland", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Vietnam", "Other",
] as const;

export const sourcesOfFunds = ["Salary or employment", "Savings", "Business income", "Investments", "Inheritance or gift", "Other"] as const;

export const documentTypes = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's licence" },
  { value: "national_id", label: "National ID card" },
] as const;

export { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/uploads";
export const ACCEPTED_UPLOADS = "image/jpeg,image/png,image/webp,application/pdf";
