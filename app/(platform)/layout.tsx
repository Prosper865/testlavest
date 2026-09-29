import { PlatformHeader } from "@/components/layout/platform-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/toast";
import { AlertWatcher, ReminderBanner } from "@/features/alerts";
import { AutoContributions } from "@/features/investments/components/auto-contributions";
import { ResetDemoButton } from "@/features/portfolio/components/reset-demo-button";
import { cn } from "@/lib/utils";
import styles from "./platform.module.css";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PlatformHeader />
      <AutoContributions />
      <AlertWatcher />
      <main id="main" className={cn("shell", styles.main)}>
        <ReminderBanner />
        {children}
        <div className={styles.footerNote}>
          <span>Demo account · virtual funds and simulated prices · saved in this browser</span>
          <ResetDemoButton />
        </div>
      </main>
      <SiteFooter />
      <Toaster />
    </>
  );
}
