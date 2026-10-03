import { desc, eq } from "drizzle-orm";
import { Icon } from "@/components/ui";
import { Card, PageHeader } from "@/features/admin";
import { OrderReviewForm } from "@/features/payments/order-review-form";
import { orderColumns } from "@/features/payments/vehicle-order-service";
import styles from "@/features/payments/checkout.module.css";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { money } from "@/lib/format";

export const metadata = { title: "Car orders" };

export default async function VehicleOrdersPage() {
  await requireAdmin();
  const db = await getDb();
  const orders = await db.select({ ...orderColumns, userName: schema.users.name, userEmail: schema.users.email })
    .from(schema.vehicleOrders).innerJoin(schema.users, eq(schema.users.id, schema.vehicleOrders.userId))
    .orderBy(desc(schema.vehicleOrders.submittedAt));
  const ordered = [...orders.filter(order => order.status === "pending"), ...orders.filter(order => order.status !== "pending")];
  return <>
    <PageHeader title="Car orders" description="Review the proof of payment for each car order. Approving confirms the order for the user." />
    <div className={styles.stack}>
      <p className={styles.notice}>{orders.filter(order => order.status === "pending").length} orders under review</p>
      {!orders.length && <Card title="No orders yet"><p>Car orders will appear here once users start buying.</p></Card>}
      {ordered.map(order => <Card key={order.id} title={`${order.vehicleName} · ${money(order.price)}`}>
        <div className={styles.stack}>
          <div><span className={`${styles.badge} ${styles[order.status]}`}>{order.status === "pending" ? "Under review" : order.status}</span>
            <p><b>{order.userName}</b> · {order.userEmail}</p>
            <p>{order.methodName} · {order.network}</p><code className={styles.address}>{order.address}</code>
            <p className={styles.muted}>Submitted {order.submittedAt.toISOString().replace("T", " ").slice(0, 16)} UTC</p>
          </div>
          <a href={`/api/vehicle-orders/${order.id}/receipt`} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.preview} src={`/api/vehicle-orders/${order.id}/receipt`} alt={`Proof of payment for ${order.vehicleName} from ${order.userName}`} loading="lazy" />
            Open full image <Icon name="arrow-up-right" />
          </a>
          {order.status === "pending" ? <OrderReviewForm id={order.id} /> : <p>{order.status === "approved" ? "Approved: order confirmed." : "Rejected."}{order.reviewNote && ` Note: ${order.reviewNote}`}</p>}
        </div>
      </Card>)}
    </div>
  </>;
}
