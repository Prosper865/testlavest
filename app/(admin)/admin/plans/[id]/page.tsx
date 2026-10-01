import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, PageHeader } from "@/features/admin";
import { getPlan, PlanForm } from "@/features/plans";

export const metadata: Metadata = { title: "Edit plan" };

export default async function EditPlanPage({ params }: PageProps<"/admin/plans/[id]">) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();
  return (
    <>
      <PageHeader title={`Edit ${plan.name}`} description="Update what visitors see on this plan card." back={{ href: "/admin/plans", label: "Investment plans" }} />
      <Card><PlanForm plan={plan} /></Card>
    </>
  );
}
