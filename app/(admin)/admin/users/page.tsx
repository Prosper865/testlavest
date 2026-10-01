import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Card, Empty, listUsers, PageHeader, Pill } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import type { AccountStatus, KycStatus } from "@/lib/db/schema";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Users" };

const statusOptions = ["all", "active", "suspended"] as const;
const kycOptions = ["all", "not_started", "pending", "approved", "rejected"] as const;
const kycLabels: Record<(typeof kycOptions)[number], string> = { all: "Any verification", not_started: "Not started", pending: "Pending", approved: "Verified", rejected: "Rejected" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = statusOptions.find(option => option === params.status) ?? "all";
  const kyc = kycOptions.find(option => option === params.kyc) ?? "all";
  const rows = await listUsers({ q, status: status as AccountStatus | "all", kyc: kyc as KycStatus | "not_started" | "all" });

  return (
    <>
      <PageHeader title="Users" description={`${rows.length} account${rows.length === 1 ? "" : "s"}${q || status !== "all" || kyc !== "all" ? " matching your filters" : ""}.`} />
      <Card bodyless>
        <form className={styles.filters} role="search">
          <div className={styles.search}>
            <input type="search" name="q" defaultValue={q} placeholder="Search name or email" aria-label="Search users" />
          </div>
          <select name="status" defaultValue={status} aria-label="Account status">
            {statusOptions.map(option => <option key={option} value={option}>{option === "all" ? "Any status" : option[0].toUpperCase() + option.slice(1)}</option>)}
          </select>
          <select name="kyc" defaultValue={kyc} aria-label="Verification status">
            {kycOptions.map(option => <option key={option} value={option}>{kycLabels[option]}</option>)}
          </select>
          <button type="submit" className={styles.ghostBtn}>Apply</button>
        </form>
        {rows.length === 0 ? <Empty title="No users found">Try clearing the filters.</Empty> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>User</th><th>Verification</th><th className={styles.hideSm}>Status</th><th className={styles.hideSm}>Joined</th><th className={styles.hideSm}>Last login</th><th><span className="visually-hidden">Open</span></th></tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td><Link href={`/admin/users/${row.id}`} className={styles.rowLink}><div className={styles.person}><Avatar name={row.name} /><div><b>{row.name} {row.role === "admin" && <Pill status="admin" />}</b><small>{row.email}</small></div></div></Link></td>
                    <td>{row.role === "admin" ? <span className={styles.muted}>—</span> : <Pill status={row.kycStatus} />}</td>
                    <td className={styles.hideSm}><Pill status={row.status} /></td>
                    <td className={cn(styles.muted, styles.hideSm)}>{formatDate(row.createdAt.getTime())}</td>
                    <td className={cn(styles.muted, styles.hideSm)}>{row.lastLoginAt ? formatDateTime(row.lastLoginAt.getTime()) : "Never"}</td>
                    <td><Link href={`/admin/users/${row.id}`} className={styles.open}>View</Link></td>
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
