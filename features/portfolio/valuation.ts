"use client";

import { useQuotes } from "@/features/market/quotes";
import { usePortfolio } from "./store";
import { useAccount } from "@/features/account";

export function usePortfolioValuation() {
  const portfolio = usePortfolio();
  const quotes = useQuotes();
  const accountPayments = useAccount().planPayments;
  const approvedPlans = accountPayments.balanceAmount;
  const approvedDeposits = accountPayments.approvedAmount;
  const value = (balances: Record<string, number>) =>
    Object.entries(balances).reduce((sum, [symbol, amount]) => sum + (quotes[symbol]?.price ?? 0) * amount, 0);

  const stocks = value(portfolio.holdings);
  const crypto = value(portfolio.crypto);
  // Recurring crypto buys hold coins, which are already counted in `crypto`.
  const plans = portfolio.plans.reduce((sum, plan) => sum + (plan.asset ? 0 : plan.invested), 0);
  const reserved = portfolio.reservations.reduce((sum, item) => sum + item.deposit, 0);
  const pendingCash = accountPayments.pendingWithdrawalAmount;
  const total = approvedPlans + stocks + crypto + plans + reserved;

  return { portfolio, quotes, cash: accountPayments.availableWithdrawalAmount, stocks, crypto, plans, approvedPlans, approvedDeposits, reserved, pendingCash, total };
}
