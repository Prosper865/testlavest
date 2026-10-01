import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Card, documentLabels, getKycDetail, PageHeader, Pill, ReviewPanel } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Review submission" };

function age(dateOfBirth: string) {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  const now = new Date();
  let years = now.getUTCFullYear() - birth.getUTCFullYear();
  if (now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) years--;
  return years;
}

function DocumentPreview({ id, file, label, fileKey }: { id: string; file: "document" | "selfie"; label: string; fileKey: string }) {
  const src = `/api/kyc/${id}/${file}`;
  const isPdf = fileKey.endsWith(".pdf");
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className={styles.doc}>
      {isPdf ? <object data={src} type="application/pdf" aria-label={label} /> : (
        // eslint-disable-next-line @next/next/no-img-element -- private, auth-checked image; not optimisable
        <img src={src} alt={label} />
      )}
      <span>{label}<b aria-hidden="true">Open ↗</b></span>
    </a>
  );
}

export default async function KycDetailPage({ params }: PageProps<"/admin/kyc/[id]">) {
  const { id } = await params;
  const detail = await getKycDetail(id);
  if (!detail || !detail.user) notFound();
  const { submission, user, reviewerName, history } = detail;

  const facts: [string, string][] = [
    ["Legal name", submission.legalName],
    ["Account name", user.name],
    ["Date of birth", `${formatDate(Date.parse(`${submission.dateOfBirth}T00:00:00Z`))} (age ${age(submission.dateOfBirth)})`],
    ["Nationality", submission.nationality],
    ["Phone", submission.phone],
    ["Occupation", submission.occupation],
    ["Address", `${submission.addressLine}, ${submission.city} ${submission.postalCode}`],
    ["Country of residence", submission.country],
    ["Source of funds", submission.sourceOfFunds],
    ["Document", `${documentLabels[submission.documentType]} ending ${submission.documentLast4}`],
  ];

  return (
    <>
      <PageHeader title={submission.legalName} description={`Submitted ${formatDateTime(submission.submittedAt.getTime())}`} back={{ href: "/admin/kyc", label: "KYC reviews" }} actions={<Pill status={submission.status} />} />
      <div className={styles.detail}>
        <div className={styles.grid}>
          <Card title="Uploaded documents">
            <div className={styles.docs}>
              <DocumentPreview id={submission.id} file="document" label={documentLabels[submission.documentType]} fileKey={submission.documentFile} />
              <DocumentPreview id={submission.id} file="selfie" label="Selfie" fileKey={submission.selfieFile} />
            </div>
          </Card>
          <Card title="Applicant details">
            <dl className={styles.facts}>
              {facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}
            </dl>
          </Card>
        </div>
        <div className={`${styles.grid} ${styles.review}`}>
          <Card title="Decision">
            {submission.status === "pending" ? <ReviewPanel submissionId={submission.id} /> : (
              <p className={styles.decided}>
                <b>{submission.status === "approved" ? "Approved" : "Rejected"}</b> by {reviewerName ?? "an admin"} on {submission.reviewedAt ? formatDateTime(submission.reviewedAt.getTime()) : "—"}.
                {submission.reviewNote && <><br />Note: “{submission.reviewNote}”</>}
              </p>
            )}
          </Card>
          <Card title="Account">
            <div className={styles.person}><Avatar name={user.name} /><div><b><Link href={`/admin/users/${user.id}`} className={styles.rowLink}>{user.name}</Link></b><small>{user.email}</small></div></div>
            <ul className={`${styles.timeline} ${styles.spaced}`}>
              <li><span className={styles.muted}>Joined</span><span>{formatDate(user.createdAt.getTime())}</span></li>
              <li><span className={styles.muted}>Account status</span><Pill status={user.status} /></li>
              <li><span className={styles.muted}>Submissions</span><span>{history.length}</span></li>
            </ul>
          </Card>
          {history.length > 1 && (
            <Card title="Submission history">
              <ul className={styles.timeline}>
                {history.map(item => (
                  <li key={item.id}>
                    <Link href={`/admin/kyc/${item.id}`} className={styles.rowLink}>{formatDate(item.submittedAt.getTime())}{item.id === submission.id ? " (this one)" : ""}</Link>
                    <Pill status={item.status} />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
