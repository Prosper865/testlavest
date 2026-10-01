import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/ui";
import { getLatestKyc, KycStatusCard, KycWizard } from "@/features/kyc";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Verify your identity" };

export default async function VerifyPage({ searchParams }: PageProps<"/verify">) {
  const user = await requireUser("/verify");
  if (user.role === "admin") redirect("/admin");
  const latest = await getLatestKyc(user.id);
  const { resubmit } = await searchParams;

  if (latest && !(latest.status === "rejected" && resubmit)) {
    return <KycStatusCard status={latest.status} submittedAt={latest.submittedAt} reviewedAt={latest.reviewedAt} reviewNote={latest.reviewNote} />;
  }

  return (
    <>
      <SectionHeading level="h1" eyebrow="Identity verification" title="Verify your identity to start trading." aside="Required by financial regulations. Takes about 3 minutes." />
      <KycWizard defaultName={user.name} rejectedNote={latest?.status === "rejected" ? latest.reviewNote : null} />
    </>
  );
}
