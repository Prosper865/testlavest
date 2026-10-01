import { MobilePageShell } from "@/features/mobile-app/mobile-shell";
import { Toaster } from "@/components/ui/toast";
import { AccountProvider, KycBanner } from "@/features/account";
import { AlertWatcher, ReminderBanner } from "@/features/alerts";
import { AutoContributions } from "@/features/investments/components/auto-contributions";
import { ResetDemoButton } from "@/features/portfolio/components/reset-demo-button";
import { requireUser } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { paymentSummary } from "@/features/payments/plan-payment-service";
import styles from "./platform.module.css";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const payments = await paymentSummary(await getDb(), user.id);
  return (
    <AccountProvider key={user.id} user={user} initialPayments={payments}>
      <AutoContributions />
      <AlertWatcher />
      <MobilePageShell>
        <KycBanner />
        <ReminderBanner />
        {children}
        <div className={styles.footerNote}>
          <ResetDemoButton />
        </div>
      </MobilePageShell>
      <Toaster />
    </AccountProvider>
  );
}
