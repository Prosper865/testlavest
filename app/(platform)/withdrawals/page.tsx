import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { WithdrawalForm } from "@/features/withdrawals/withdrawal-form";
import { WithdrawalHistory } from "@/features/withdrawals/withdrawal-history";
import styles from "@/features/payments/checkout.module.css";
import { Icon } from "@/components/ui";

export const metadata = { title: "Withdraw funds" };

export default async function WithdrawalsPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  await requireUser("/withdrawals");
  const { submitted } = await searchParams;
  const requestId = crypto.randomUUID();
  return <div className={styles.stack}>
    <Link href="/dashboard"><Icon name="arrow-left" /> Back to dashboard</Link>
    <div><span className={styles.badge}>WITHDRAWALS</span><h1>Withdraw funds</h1><p>Enter the exact amount and the recipient’s bank details for admin review.</p></div>
    {submitted === "1" && <p role="status" className={styles.notice}>Withdrawal request received. Track its status below.</p>}
    <WithdrawalHistory />
    <WithdrawalForm key={requestId} requestId={requestId} />
  </div>;
}
