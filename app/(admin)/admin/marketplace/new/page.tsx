import type { Metadata } from "next";
import { Card, PageHeader } from "@/features/admin";
import { VehicleForm } from "@/features/marketplace";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Add car" };

export default async function NewVehiclePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add car" description="List a new car in the marketplace." back={{ href: "/admin/marketplace", label: "Marketplace cars" }} />
      <Card><VehicleForm /></Card>
    </>
  );
}
