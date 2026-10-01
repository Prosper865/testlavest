import { desc, eq } from "drizzle-orm";
import { Card, PageHeader } from "@/features/admin";
import { PaymentReviewForm } from "@/features/payments/review-form";
import { paymentColumns } from "@/features/payments/plan-payment-service";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { money } from "@/lib/format";
import styles from "@/features/payments/checkout.module.css";

export const metadata = { title: "Plan payment reviews" };

export default async function PlanPaymentReviewsPage() {
  await requireAdmin();
  const db = await getDb();
  const payments = await db.select({ ...paymentColumns, userName: schema.users.name, userEmail: schema.users.email })
    .from(schema.planPayments).innerJoin(schema.users, eq(schema.users.id, schema.planPayments.userId))
    .orderBy(desc(schema.planPayments.submittedAt));
  const ordered = [...payments.filter(payment => payment.status === "pending"), ...payments.filter(payment => payment.status !== "pending")];
  return <>
    <PageHeader title="Plan payment reviews" description="Review payment screenshots. Approval adds the submitted amount to the user’s investment balance." />
    <div className={styles.stack}>
      <p className={styles.notice}>{payments.filter(payment => payment.status === "pending").length} payments under review</p>
      {!payments.length && <Card title="No submissions yet"><p>User payment screenshots will appear here.</p></Card>}
      {ordered.map(payment => <Card key={payment.id} title={`${payment.planName} · ${money(payment.amount)}`}>
        <div className={styles.stack}>
          <div><span className={`${styles.badge} ${styles[payment.status]}`}>{payment.status === "pending" ? "Under review" : payment.status}</span>
            <p><b>{payment.userName}</b> · {payment.userEmail}</p>
            <p>{payment.methodName} · {payment.network}</p><code className={styles.address}>{payment.address}</code>
            <p className={styles.muted}>Submitted {payment.submittedAt.toISOString().replace("T", " ").slice(0, 16)} UTC</p>
          </div>
          <a href={`/api/plan-payments/${payment.id}/receipt`} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.preview} src={`/api/plan-payments/${payment.id}/receipt`} alt={`Payment screenshot for ${payment.planName} submitted by ${payment.userName}`} loading="lazy" />
            Open full screenshot ↗
          </a>
          {payment.status === "pending" ? <PaymentReviewForm id={payment.id} /> : <p>{payment.status === "approved" ? "Approved — balance credited." : "Rejected — no balance credited."}{payment.reviewNote && ` Note: ${payment.reviewNote}`}</p>}
        </div>
      </Card>)}
    </div>
  </>;
}
