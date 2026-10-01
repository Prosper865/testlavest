"use server";

import { getCurrentUser } from "@/lib/auth/dal";
import { getDb } from "@/lib/db";
import { paymentSummary } from "@/features/payments/plan-payment-service";
import { PortfolioError, transactPortfolio } from "./service";
import { ZodError } from "zod";

export async function executePortfolioAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in to use your account.", summary: null };
  const db = await getDb();
  try {
    const result = await transactPortfolio(db, user.id, input);
    return { ...result, summary: await paymentSummary(db, user.id) };
  } catch (error) {
    return { ok: false, message: error instanceof PortfolioError ? error.message : error instanceof ZodError ? "Enter a valid transaction amount and asset." : "Could not confirm the transaction. Refresh your balance before trying again.", summary: null };
  }
}
