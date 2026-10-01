import type { Metadata } from "next";
import MobileApp from "@/features/mobile-app/mobile-app";
import { listVisiblePlans } from "@/features/plans/queries";

export const metadata: Metadata = { title: "Aurevia Invest" };

export default async function DashboardPage() {
  const plans = await listVisiblePlans();
  return <MobileApp availablePlans={plans.map(({ id, name, minInvestment, duration }) => ({ id, name, minInvestment, duration }))} />;
}
