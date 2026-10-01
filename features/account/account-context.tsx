"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { PlanPaymentSummary } from "@/features/payments/plan-payment-service";
import { configurePortfolio, syncPortfolio } from "@/features/portfolio/store";
import type { CurrentUser } from "@/lib/auth/dal";

type Account = CurrentUser & { planPayments: PlanPaymentSummary; paymentSyncError: boolean };
const AccountContext = createContext<Account | null>(null);

/**
 * Makes the signed-in user available to client components, binds the demo portfolio to them,
 * and unlocks money-moving actions only once their identity is verified.
 */
export function AccountProvider({ user, initialPayments, children }: { user: CurrentUser; initialPayments: PlanPaymentSummary; children: ReactNode }) {
  const [planPayments, setPlanPayments] = useState(initialPayments);
  const [paymentSyncError, setPaymentSyncError] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    async function refresh() {
      if (busy || document.visibilityState === "hidden") return;
      busy = true;
      try {
        const response = await fetch("/api/plan-payments", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Unable to refresh payments");
        const data: PlanPaymentSummary = await response.json();
        if (!controller.signal.aborted) { setPlanPayments(current => data.portfolioVersion < current.portfolioVersion ? current : data); setPaymentSyncError(false); }
      } catch {
        if (!controller.signal.aborted) setPaymentSyncError(true);
      } finally { busy = false; }
    }
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    const onPortfolioUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; summary: PlanPaymentSummary }>).detail;
      if (detail.userId === user.id) { setPlanPayments(detail.summary); setPaymentSyncError(false); }
    };
    window.addEventListener("portfolio-updated", onPortfolioUpdate);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("portfolio-updated", onPortfolioUpdate); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [user.id, pathname, initialPayments]);
  configurePortfolio({ ownerId: user.id, tradingEnabled: user.kycStatus === "approved" || user.role === "admin" });
  useEffect(() => { syncPortfolio(planPayments); }, [planPayments, user.id]);
  return <AccountContext.Provider value={{ ...user, planPayments, paymentSyncError }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const user = useContext(AccountContext);
  if (!user) throw new Error("useAccount must be used inside AccountProvider.");
  return user;
}
