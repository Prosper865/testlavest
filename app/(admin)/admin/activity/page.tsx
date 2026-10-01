import type { Metadata } from "next";
import Link from "next/link";
import { auditTone, Card, describeAudit, Empty, listActivity, PageHeader } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity log" };

export default async function ActivityPage() {
  const entries = await listActivity(150);
  return (
    <>
      <PageHeader title="Activity log" description="Sign-ups, logins, verification decisions, and account changes. Latest 150 events." />
      <Card bodyless>
        {entries.length === 0 ? <Empty title="No activity yet" /> : (
          <ul className={styles.feed}>
            {entries.map(entry => (
              <li key={entry.id}>
                <span className={cn(styles.dot, auditTone(entry.action))} aria-hidden="true" />
                <div>
                  {entry.targetUserId ? <Link href={`/admin/users/${entry.targetUserId}`} className={styles.rowLink}>{describeAudit(entry)}</Link> : describeAudit(entry)}
                  <time dateTime={entry.createdAt.toISOString()}>{formatDateTime(entry.createdAt.getTime())}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
