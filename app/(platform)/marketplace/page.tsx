import type { Metadata } from "next";
import { SectionHeading, Tag } from "@/components/ui";
import { listVehicles, MarketplaceWorkspace, OrdersPanel, ReservationsPanel, VehiclesProvider } from "@/features/marketplace";
import checkoutStyles from "@/features/payments/checkout.module.css";
import { listUserOrders } from "@/features/payments/vehicle-order-service";
import { requireUser } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import styles from "../platform.module.css";

export const metadata: Metadata = { title: "Tesla marketplace" };

export default async function MarketplacePage({ searchParams }: PageProps<"/marketplace">) {
  const user = await requireUser("/marketplace");
  const [vehicles, orders, params] = await Promise.all([listVehicles(), getDb().then(db => listUserOrders(db, user.id)), searchParams]);
  return (
    <VehiclesProvider vehicles={vehicles}>
      <SectionHeading level="h1" eyebrow="Marketplace · Tesla" title="A curated EV selection." aside={<Tag>Illustrative listings</Tag>} />
      <p className={styles.intro}>New and inspected pre-owned Tesla vehicles, hand-picked. Buy one by crypto wallet or bank transfer, or save toward it automatically.</p>
      {params.ordered && <p className={checkoutStyles.notice} role="status">Order received. We&apos;ll confirm it once your payment has been reviewed. You can follow it under Your orders below.</p>}
      <MarketplaceWorkspace />
      <div className={styles.section}>
        <OrdersPanel orders={orders} />
      </div>
      <div className={styles.section}>
        <ReservationsPanel />
      </div>
    </VehiclesProvider>
  );
}
