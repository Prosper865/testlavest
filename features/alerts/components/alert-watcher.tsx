"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { useQuotes } from "@/features/market/quotes";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { money } from "@/lib/format";

/** Checks active price alerts against every quote update and notifies when one is crossed. */
export function AlertWatcher() {
  const quotes = useQuotes();
  const { alerts } = usePortfolio();

  useEffect(() => {
    for (const alert of alerts) {
      if (alert.triggeredAt) continue;
      const price = quotes[alert.symbol]?.price;
      if (price === undefined) continue;
      const crossed = alert.direction === "above" ? price >= alert.price : price <= alert.price;
      if (crossed && portfolioActions.triggerAlert(alert.id, price)) {
        toast(`${alert.symbol} is ${alert.direction} ${money(alert.price)}`, `Now trading at ${money(price)}.`);
      }
    }
  }, [quotes, alerts]);

  return null;
}
