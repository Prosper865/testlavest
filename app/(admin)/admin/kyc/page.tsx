import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Card, documentLabels, Empty, listKyc, PageHeader, Pill } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import type { KycStatus } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "KYC reviews" };

const tabs: { value: KycStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default async function KycQueuePage({ searchParams }: PageProps<"/admin/kyc">) {
  const params = await searchParams;
  const status = tabs.some(tab => tab.value === params.status) ? (params.status as KycStatus | "all") : "pending";
  const q = typeof params.q === "string" ? params.q : "";
  const rows = await listKyc({ status, q });

  return (
    <>
      <PageHeader title="KYC reviews" description="Review identity submissions. Pending submissions are listed oldest first." />
      <Card bodyless>
        <div className={styles.filters}>
          <nav className={styles.tabs} aria-label="Filter by status">
            {tabs.map(tab => (
              <Link key={tab.value} href={{ pathname: "/admin/kyc", query: { status: tab.value, ...(q ? { q } : {}) } }} aria-current={status === tab.value ? "page" : undefined}>{tab.label}</Link>
            ))}
          </nav>
          <form className={styles.search} role="search">
            <input type="hidden" name="status" value={status} />
            <input type="search" name="q" defaultValue={q} placeholder="Search name or email" aria-label="Search submissions" />
            <button type="submit">Search</button>
          </form>
        </div>
        {rows.length === 0 ? (
          <Empty title={status === "pending" && !q ? "All caught up" : "No submissions found"}>{status === "pending" && !q ? "There are no identity submissions waiting for review." : "Try another filter or search."}</Empty>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Applicant</th><th className={styles.hideSm}>Document</th><th className={styles.hideSm}>Country</th><th className={styles.hideSm}>Submitted</th><th>Status</th><th><span className="visually-hidden">Open</span></th></tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td><Link href={`/admin/kyc/${row.id}`} className={styles.rowLink}><div className={styles.person}><Avatar name={row.legalName} /><div><b>{row.legalName}</b><small>{row.email}</small></div></div></Link></td>
                    <td className={cn(styles.muted, styles.hideSm)}>{documentLabels[row.documentType]}</td>
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
    </>
  );
}
