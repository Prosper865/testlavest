import { desc, eq } from "drizzle-orm";
import { Card, PageHeader } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { money } from "@/lib/format";
import { WithdrawalReviewForm } from "@/features/withdrawals/review-form";
import styles from "@/features/payments/checkout.module.css";

export const metadata = { title: "Withdrawal requests" };

export default async function AdminWithdrawalsPage() {
  await requireAdmin();
  const db = await getDb();
  const rows = await db.select({ withdrawal: schema.withdrawals, userName: schema.users.name, userEmail: schema.users.email })
    .from(schema.withdrawals).innerJoin(schema.users, eq(schema.users.id, schema.withdrawals.userId))
    .orderBy(desc(schema.withdrawals.submittedAt));
  const ordered = [...rows.filter(row => row.withdrawal.status === "pending"), ...rows.filter(row => row.withdrawal.status !== "pending")];
  return <>
    <PageHeader title="Withdrawal requests" description="Review the recipient’s bank details, then mark withdrawals as sent or reject them." />
    <div className={styles.stack}>
      <p className={styles.notice}>{rows.filter(row => row.withdrawal.status === "pending").length} pending requests</p>
      {!rows.length && <Card title="No withdrawals yet"><p>User withdrawal requests will appear here.</p></Card>}
      {ordered.map(({ withdrawal: request, userName, userEmail }) => <Card key={request.id} title={`${userName} · ${money(request.amountCents / 100)}`}>
        <div className={styles.stack}>
          <div><span className={`${styles.badge} ${styles[request.status === "sent" ? "approved" : request.status]}`}>{request.status === "pending" ? "Pending review" : request.status === "sent" ? "Sent" : "Rejected"}</span><p>{userEmail}</p></div>
          <dl className={styles.grid}>
            {[["Beneficiary name", request.beneficiaryName], ["Account number", request.accountNumber], ["Routing number", request.routingNumber], ["Bank name", request.bankName], ["Recipient address", request.recipientAddress], ["Bank address", request.bankAddress]].map(([label, value]) => <div key={label}><dt className={styles.muted}>{label}</dt><dd style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: "6px 0 0" }}>{value}</dd></div>)}
          </dl>
          <p className={styles.muted}>Requested {request.submittedAt.toISOString().replace("T", " ").slice(0, 16)} UTC</p>
          {request.status === "pending" ? <WithdrawalReviewForm id={request.id} amountCents={request.amountCents} /> : <p>{request.status === "sent" ? "Sent — balance deducted." : "Rejected — no deduction."}{request.reviewNote && ` Note: ${request.reviewNote}`}</p>}
        </div>
      </Card>)}
    </div>
  </>;
}
