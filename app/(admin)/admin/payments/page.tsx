import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { Card, PageHeader, Pill } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import { PaymentForm } from "@/features/payments/payment-form";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Payment methods" };

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const db = await getDb();
  const methods = await db.select().from(schema.paymentMethods).orderBy(asc(schema.paymentMethods.name), asc(schema.paymentMethods.network));
  return <>
    <PageHeader title="Payment methods" description="Manage payment methods and the receiving address assigned to each network." />
    <div className={styles.grid}>
      <Card title={`Payment methods (${methods.length})`} bodyless>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Method</th><th>Network / provider</th><th>Payment address</th><th>Status</th></tr></thead>
            <tbody>{methods.map(method => <tr key={method.id}>
              <td><a href={`#payment-${method.id}`}><b>{method.name}</b></a></td>
              <td>{method.network}</td>
              <td style={{ minWidth: 180, maxWidth: 380, overflowWrap: "anywhere" }}>{method.address || "No address assigned"}</td>
              <td><Pill status={method.address ? "Configured" : "Not configured"} /></td>
            </tr>)}</tbody>
          </table>
          {!methods.length && <p className={styles.muted}>Add your first payment method below.</p>}
        </div>
      </Card>
      {methods.map(method => <div id={`payment-${method.id}`} key={method.id}>
        <Card title={`${method.name} · ${method.network}`}><PaymentForm method={method} /></Card>
      </div>)}
      <Card title="Add a payment method"><PaymentForm /></Card>
    </div>
  </>;
}
