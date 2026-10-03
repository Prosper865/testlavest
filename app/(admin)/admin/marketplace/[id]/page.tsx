import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, PageHeader } from "@/features/admin";
import { getVehicleForAdmin, VehicleForm, vehicleName } from "@/features/marketplace";

export const metadata: Metadata = { title: "Edit car" };

export default async function EditVehiclePage({ params }: PageProps<"/admin/marketplace/[id]">) {
  const { id } = await params;
  const vehicle = await getVehicleForAdmin(id);
  if (!vehicle) notFound();
  return (
    <>
      <PageHeader title={`Edit ${vehicleName(vehicle)}`} description="Update the photo, price, and details shown in the marketplace." back={{ href: "/admin/marketplace", label: "Marketplace cars" }} />
      <Card><VehicleForm vehicle={vehicle} /></Card>
    </>
  );
}
