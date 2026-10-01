import type { Metadata } from "next";
import Link from "next/link";
import { auditTone, Avatar, Card, describeAudit, Empty, getOverview, Icon, PageHeader, Pill, SignupsChart } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import { requireAdmin } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

function formatHours(hours: number | null) {
  if (hours === null) return "—";
  return hours < 1 ? `${Math.max(1, Math.round(hours * 60))}m` : hours < 48 ? `${hours.toFixed(1)}h` : `${Math.round(hours / 24)}d`;
}

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const data = await getOverview();

  return (
    <>
      <PageHeader title="Overview" description={`Welcome back, ${admin.name}. Here's what's happening across accounts and identity verification.`} />

      <div className={styles.stats}>
        <Card className={cn(styles.stat, data.pending > 0 && styles.statAccent)}>
          <span>Pending reviews<i><Icon name="clock" /></i></span>
          <strong>{data.pending}</strong>
          <small>{data.pending ? <Link href="/admin/kyc?status=pending" className="accent-text">Review queue →</Link> : "Queue is clear"}</small>
        </Card>
        <Card className={styles.stat}>
          <span>Total users<i><Icon name="users" /></i></span>
          <strong>{data.totalUsers}</strong>
          <small>+{data.newUsers} in the last 7 days</small>
        </Card>
        <Card className={styles.stat}>
          <span>Verified users<i><Icon name="check" /></i></span>
          <strong>{data.approved}</strong>
          <small>{data.approvalRate === null ? "No decisions yet" : `${data.approvalRate}% approval rate`}</small>
        </Card>
        <Card className={styles.stat}>
          <span>Avg. review time<i><Icon name="activity" /></i></span>
          <strong>{formatHours(data.avgReviewHours)}</strong>
          <small>Submission to decision, last 30 days</small>
        </Card>
      </div>

      <div className={styles.split}>
        <div className={styles.grid}>
          <Card title="New sign-ups">
            <SignupsChart days={data.signups} />
          </Card>
          <Card title="Latest verification submissions" action={<Link href="/admin/kyc">View all</Link>} bodyless>
            {data.recentKyc.length === 0 ? <Empty title="No submissions yet">New KYC submissions will appear here.</Empty> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Applicant</th><th className={styles.hideSm}>Country</th><th className={styles.hideSm}>Submitted</th><th>Status</th><th><span className="visually-hidden">Open</span></th></tr></thead>
                  <tbody>
                    {data.recentKyc.map(row => (
                      <tr key={row.id}>
                        <td><div className={styles.person}><Avatar name={row.name} /><div><b>{row.name}</b><small>{row.email}</small></div></div></td>
                        <td className={cn(styles.muted, styles.hideSm)}>{row.country}</td>
                        <td className={cn(styles.muted, styles.hideSm)}>{formatDateTime(row.submittedAt.getTime())}</td>
                        <td><Pill status={row.status} /></td>
                        <td><Link href={`/admin/kyc/${row.id}`} className={styles.open}>{row.status === "pending" ? "Review" : "View"}</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
        <Card title="Recent activity" action={<Link href="/admin/activity">View log</Link>} bodyless>
          {data.recentActivity.length === 0 ? <Empty title="Nothing yet" /> : (
            <ul className={styles.feed}>
              {data.recentActivity.map(entry => (
                <li key={entry.id}>
                  <span className={cn(styles.dot, auditTone(entry.action))} aria-hidden="true" />
                  <div>{describeAudit(entry)}<time dateTime={entry.createdAt.toISOString()}>{formatDateTime(entry.createdAt.getTime())}</time></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
