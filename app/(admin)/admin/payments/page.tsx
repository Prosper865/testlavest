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
  const methods = await db.select().from(schema.paymentMethods).orderBy(asc(schema.paymentMethods.kind), asc(schema.paymentMethods.name), asc(schema.paymentMethods.network));
  return <>
    <PageHeader title="Payment methods" description="Wallets and bank accounts users can pay into. Users choose between a wallet and a bank transfer when they deposit." />
    <div className={styles.grid}>
      <Card title={`Payment methods (${methods.length})`} bodyless>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Method</th><th>Type</th><th>Details</th><th>Status</th></tr></thead>
            <tbody>{methods.map(method => <tr key={method.id}>
              <td><a href={`#payment-${method.id}`}><b>{method.name}</b></a></td>
              <td>{method.kind === "bank" ? "Bank transfer" : `Wallet · ${method.network}`}</td>
              <td style={{ minWidth: 180, maxWidth: 380, overflowWrap: "anywhere" }}>
                {method.kind === "bank" ? `${method.accountName} · ${method.address}${method.routingNumber ? ` · ${method.routingNumber}` : ""}` : method.address || "No address assigned"}
              </td>
              <td><Pill status={method.address ? "Configured" : "Not configured"} /></td>
            </tr>)}</tbody>
          </table>
          {!methods.length && <p className={styles.muted}>Add your first wallet or bank account below.</p>}
        </div>
      </Card>
      {methods.map(method => <div id={`payment-${method.id}`} key={method.id}>
        <Card title={method.kind === "bank" ? `${method.name} · Bank transfer` : `${method.name} · ${method.network}`}><PaymentForm method={method} /></Card>
      </div>)}
      <Card title="Add a bank account"><PaymentForm kind="bank" /></Card>
      <Card title="Add a wallet"><PaymentForm kind="wallet" /></Card>
    </div>
  </>;
}
