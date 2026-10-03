import { Panel, PanelHeader, EmptyState } from "@/components/ui";
import styles from "@/features/payments/checkout.module.css";
import type { listUserOrders } from "@/features/payments/vehicle-order-service";
import { formatDate, money } from "@/lib/format";

type Order = Awaited<ReturnType<typeof listUserOrders>>[number];

const statusText = { pending: "Under review", approved: "Order confirmed", rejected: "Not approved" } as const;

/** The signed-in user's car orders and where each one stands. */
export function OrdersPanel({ orders }: { orders: Order[] }) {
  return (
    <Panel aria-labelledby="orders-heading">
      <PanelHeader title={<span id="orders-heading">Your orders</span>} />
      {orders.length === 0 ? (
        <EmptyState>No car orders yet. Choose a car above and tap Buy to get started.</EmptyState>
      ) : (
        <div className={styles.stack} style={{ margin: 0 }}>
          {orders.map(order => (
            <article key={order.id} className={styles.card}>
              <span className={`${styles.badge} ${styles[order.status]}`}>{statusText[order.status]}</span>
              <h3>{order.vehicleName}</h3>
              <strong className={styles.amount}>{money(order.price)}</strong>
              <p>{order.methodName} · {order.network} · Ordered {formatDate(order.submittedAt.getTime())}</p>
              <p>{order.status === "pending" ? "We received your proof of payment and an admin is reviewing it."
                : order.status === "approved" ? "Your payment was verified and your order is confirmed."
                : "We couldn't verify this payment. You can place a new order."}</p>
              {order.reviewNote && <p><b>Admin note:</b> {order.reviewNote}</p>}
              <div className={styles.actions}>
                <a href={`/api/vehicle-orders/${order.id}/receipt`} target="_blank" rel="noreferrer" className={styles.secondary}>View proof of payment</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}
