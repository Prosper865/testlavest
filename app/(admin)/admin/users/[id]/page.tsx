import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auditTone, Avatar, Card, describeAudit, documentLabels, Empty, getUserDetail, PageHeader, Pill, UserActions } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProfitForm } from "@/features/admin/components/profit-form";

export const metadata: Metadata = { title: "User" };

export default async function UserDetailPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();
  const { user, submissions, activity, isSelf } = detail;
  const latest = submissions[0];

  return (
    <>
      <PageHeader title={user.name} description={user.email} back={{ href: "/admin/users", label: "Users" }} />
      <div className={styles.detail}>
        <div className={styles.grid}>
          {user.role === "user" && <Card title="Update user profit"><ProfitForm userId={user.id} name={user.name} profitCents={user.profitCents} /></Card>}
          <Card title="Verification history" bodyless>
            {submissions.length === 0 ? <Empty title="No submissions">This user hasn&apos;t started identity verification.</Empty> : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Submitted</th><th className={styles.hideSm}>Document</th><th>Status</th><th className={styles.hideSm}>Note</th><th><span className="visually-hidden">Open</span></th></tr></thead>
                  <tbody>
                    {submissions.map(item => (
                      <tr key={item.id}>
                        <td>{formatDateTime(item.submittedAt.getTime())}</td>
                        <td className={cn(styles.muted, styles.hideSm)}>{documentLabels[item.documentType]} · {item.country}</td>
                        <td><Pill status={item.status} /></td>
                        <td className={cn(styles.muted, styles.hideSm)}>{item.reviewNote ?? "—"}</td>
                        <td><Link href={`/admin/kyc/${item.id}`} className={styles.open}>{item.status === "pending" ? "Review" : "View"}</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <Card title="Account activity" bodyless>
            {activity.length === 0 ? <Empty title="No activity recorded" /> : (
              <ul className={styles.feed}>
                {activity.map(entry => (
                  <li key={entry.id}>
                    <span className={cn(styles.dot, auditTone(entry.action))} aria-hidden="true" />
                    <div>{describeAudit(entry)}<time dateTime={entry.createdAt.toISOString()}>{formatDateTime(entry.createdAt.getTime())}</time></div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className={styles.grid}>
          <Card>
            <div className={styles.profileHead}>
              <Avatar name={user.name} large />
              <div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <div className={styles.pillRow}>
                  <Pill status={user.status} />
                  {user.role === "admin" ? <Pill status="admin" /> : <Pill status={latest?.status ?? "not_started"} />}
                </div>
              </div>
            </div>
            <ul className={`${styles.timeline} ${styles.spaced}`}>
              <li><span className={styles.muted}>Joined</span><span>{formatDate(user.createdAt.getTime())}</span></li>
              <li><span className={styles.muted}>Last login</span><span>{user.lastLoginAt ? formatDateTime(user.lastLoginAt.getTime()) : "Never"}</span></li>
              <li><span className={styles.muted}>User ID</span><span className={styles.muted}>{user.id.slice(0, 8)}</span></li>
            </ul>
          </Card>
          <Card title="Manage account">
            {isSelf ? <p className={styles.decided}>This is your account. Another admin must change your status or role.</p> : <UserActions userId={user.id} status={user.status} role={user.role} name={user.name} />}
          </Card>
        </div>
      </div>
    </>
  );
}
