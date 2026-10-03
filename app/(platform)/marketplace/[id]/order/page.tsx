import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui";
import { findVehicle, VehicleCard, vehicleName } from "@/features/marketplace";
import marketplaceStyles from "@/features/marketplace/components/marketplace.module.css";
import { CheckoutForm } from "@/features/payments/checkout-form";
import styles from "@/features/payments/checkout.module.css";
import { listPayableMethods } from "@/features/payments/method-queries";
import { requireUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { money } from "@/lib/format";

export const metadata = { title: "Order a car" };

export default async function OrderVehiclePage({ params }: PageProps<"/marketplace/[id]/order">) {
  const { id } = await params;
  const user = await requireUser(`/marketplace/${id}/order`);
  const vehicle = await findVehicle(id);
  if (!vehicle?.visible) notFound();
  const db = await getDb();
  const [methods, pending] = await Promise.all([
    listPayableMethods(),
    db.select({ id: schema.vehicleOrders.id }).from(schema.vehicleOrders)
      .where(and(eq(schema.vehicleOrders.userId, user.id), eq(schema.vehicleOrders.vehicleId, id), eq(schema.vehicleOrders.status, "pending"))),
  ]);
  const name = vehicleName(vehicle);
  return <div className={styles.stack}>
    <Link href="/marketplace"><Icon name="arrow-left" /> Back to marketplace</Link>
    <div><span className={styles.badge}>ORDER</span><h1>Order your {vehicle.model}</h1><p>Pay {money(vehicle.price)} by crypto wallet or bank transfer and upload your proof of payment. We confirm your order after review.</p></div>
    <div className={marketplaceStyles.orderLayout}>
      <VehicleCard vehicle={vehicle} />
      <div className={styles.card}>
        <h2>Payment</h2>
        {pending.length ? <p className={styles.notice}>Your order for this car is already under review. <Link href="/marketplace">View your orders</Link>.</p> :
          <CheckoutForm order={{ vehicleId: vehicle.id, name, price: vehicle.price }} methods={methods} submissionId={crypto.randomUUID()} />}
      </div>
    </div>
  </div>;
}
