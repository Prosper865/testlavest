"use client";

import { useEffect } from "react";
import { portfolioActions } from "@/features/portfolio/store";

/** Processes due recurring contributions while the platform is open. A backend scheduler replaces this in production. */
export function AutoContributions() {
  useEffect(() => {
    portfolioActions.processDuePlans();
    const timer = setInterval(portfolioActions.processDuePlans, 60_000);
    return () => clearInterval(timer);
  }, []);
  return null;
}
