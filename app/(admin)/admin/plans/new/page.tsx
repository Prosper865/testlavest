import type { Metadata } from "next";
import { Card, PageHeader } from "@/features/admin";
import { PlanForm } from "@/features/plans";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "New plan" };

export default async function NewPlanPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New plan" description="Add a plan card to the website." back={{ href: "/admin/plans", label: "Investment plans" }} />
      <Card><PlanForm /></Card>
    </>
  );
}
