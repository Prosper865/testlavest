import type { CurrentUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils";
import styles from "./account.module.css";

const labels: Record<CurrentUser["kycStatus"], string> = {
  approved: "Verified",
  pending: "In review",
  rejected: "Needs attention",
  not_started: "Not verified",
};

export function KycStatusPill({ status }: { status: CurrentUser["kycStatus"] }) {
  return <span className={cn(styles.pill, styles[status])}>{labels[status]}</span>;
}
