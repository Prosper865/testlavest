import type { Metadata } from "next";
import { AdminShell, getPendingCount } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const pendingCount = await getPendingCount();
  return <AdminShell admin={{ name: admin.name, email: admin.email }} pendingCount={pendingCount}>{children}</AdminShell>;
}
