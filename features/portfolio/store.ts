"use client";

// Account balances and holdings come from the server. Only personal preferences
// are restored from localStorage. Financial commands are authenticated server actions.

import { useSyncExternalStore } from "react";
import { getQuotes } from "@/features/market/quotes";
import { money } from "@/lib/format";
import { createId } from "@/lib/utils";

export * from "./model";
import { initialPortfolio, type PortfolioState, type ActionResult, type Activity, type Module, type Frequency, type SavingsGoal, type PriceAlert, type Reminder } from "./model";
import { executePortfolioAction } from "./actions";
import type { PlanPaymentSummary } from "@/features/payments/plan-payment-service";

const STORAGE_KEY = "aurevia-demo-portfolio";

let state = initialPortfolio;
let loaded = false;
let owner: string | null = null;
let tradingEnabled = false;
const listeners = new Set<() => void>();
const storageKey = () => `${STORAGE_KEY}:${owner}`;

/**
 * Binds the demo account to the signed-in user (each user gets their own saved portfolio) and
 * sets whether money-moving actions are allowed (only after identity verification).
 * Called while rendering the account provider; safe to call repeatedly.
 */
export function configurePortfolio(options: { ownerId: string; tradingEnabled: boolean }) {
  if (typeof window === "undefined") return;
  tradingEnabled = options.tradingEnabled;
  if (owner === options.ownerId) return;
  owner = options.ownerId;
  serverVersion = -1;
  state = initialPortfolio;
  loaded = false;
  load();
  listeners.forEach(listener => listener());
}

export function isTradingEnabled() {
  return tradingEnabled;
}

export const VERIFY_TO_TRADE = "Verify your identity to trade. Open Account → Verify identity.";

function load() {
  if (loaded || !owner || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey()) ?? "null");
    if (saved?.version === 1) state = { ...initialPortfolio, watchlist: saved.watchlist ?? initialPortfolio.watchlist, alerts: saved.alerts ?? [], reminders: saved.reminders ?? [] };
  } catch {
    // Ignore unreadable storage and keep the default account.
  }
}

function commit(next: PortfolioState) {
  state = next;
  if (owner) {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ version: 1, watchlist: state.watchlist, alerts: state.alerts, reminders: state.reminders }));
    } catch {
      // Storage can be unavailable (private mode); the session still works in memory.
    }
  }
  listeners.forEach(listener => listener());
}

function log(module: Module, text: string): Activity {
  return { id: createId("act"), time: Date.now(), module, text };
}

function withActivity(next: Omit<PortfolioState, "activity">, entry: Activity): PortfolioState {
  return { ...next, activity: [entry, ...state.activity].slice(0, 60) };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

export function usePortfolio() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initialPortfolio);
}

const fail = (message: string): ActionResult => ({ ok: false, message });
let pending = false;
let serverVersion = -1;
export function syncPortfolio(summary: PlanPaymentSummary) {
  if (summary.portfolioVersion < serverVersion) return;
  serverVersion = summary.portfolioVersion;
  commit({ ...state, ...summary.portfolio, cash: summary.availableWithdrawalAmount, deposits: 0 });
}
async function perform(command: string, args: unknown[]): Promise<ActionResult> {
  if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
  if (pending) return fail("An account transaction is already processing. Please wait.");
  pending = true;
  const requestedOwner = owner;
  try {
    const result = await executePortfolioAction({ id: crypto.randomUUID(), command, args });
    if (owner === requestedOwner && result.summary) {
      syncPortfolio(result.summary);
      window.dispatchEvent(new CustomEvent("portfolio-updated", { detail: { userId: owner, summary: result.summary } }));
    }
    return { ok: result.ok, message: result.message };
  } catch { return fail("Could not confirm the transaction. Refresh your balance before trying again."); }
  finally { pending = false; }
}

export const portfolioActions = {
  tradeStock(symbol: string, side: "Buy" | "Sell", quantity: number) {
    return perform("tradeStock", [symbol, side, quantity]);
  },

  /** Fractional order sized in dollars, e.g. "$50 of TSLA". */
  tradeStockDollars(symbol: string, side: "Buy" | "Sell", usd: number) {
    return perform("tradeStockDollars", [symbol, side, usd]);
  },

  toggleWatch(symbol: string) {
    const watchlist = state.watchlist.includes(symbol) ? state.watchlist.filter(item => item !== symbol) : [...state.watchlist, symbol];
    commit({ ...state, watchlist });
  },

  withdrawCrypto(asset: string, amount: number, destination: string) {
    return perform("withdrawCrypto", [asset, amount, destination]);
  },

  buyCrypto(asset: string, usd: number) {
    return perform("buyCrypto", [asset, usd]);
  },

  sellCrypto(asset: string, units: number) {
    return perform("sellCrypto", [asset, units]);
  },

  createPlan(strategyId: string, _strategyName: string, amount: number, frequency: Frequency, asset?: string, goal?: SavingsGoal) {
    return perform("createPlan", [strategyId, amount, frequency, asset ?? null, goal?.vehicleId ?? null]);
  },

  togglePlan(id: string) {
    return perform("togglePlan", [id]);
  },

  removePlan(id: string) {
    return perform("removePlan", [id]);
  },

  contribute(id: string) {
    return perform("contribute", [id]);
  },

  /** Runs every active plan whose next date has passed, as long as cash allows. Reached goals stop automatically. */
  processDuePlans() {
    return perform("processDuePlans", []);
  },

  /** Moves a goal's savings to cash and reserves the vehicle with the deposit. */
  completeGoal(id: string) {
    return perform("completeGoal", [id]);
  },

  reserveVehicle(vehicleId: string) {
    return perform("reserveVehicle", [vehicleId]);
  },

  cancelReservation(vehicleId: string) {
    return perform("cancelReservation", [vehicleId]);
  },

  addAlert(symbol: string, direction: PriceAlert["direction"], price: number): ActionResult {
    if (!(price > 0)) return fail("Enter a target price above zero.");
    const current = getQuotes()[symbol]?.price;
    if (current !== undefined && (direction === "above" ? current >= price : current <= price)) {
      return fail(`${symbol} is already ${direction} ${money(price)} (now ${money(current)}).`);
    }
    const alert: PriceAlert = { id: createId("alert"), symbol, direction, price, createdAt: Date.now() };
    const message = `Alert set: ${symbol} ${direction} ${money(price)}.`;
    commit(withActivity({ ...state, alerts: [alert, ...state.alerts] }, log("alerts", message)));
    return { ok: true, message };
  },

  removeAlert(id: string) {
    commit({ ...state, alerts: state.alerts.filter(alert => alert.id !== id) });
  },

  /** Marks an alert as triggered. Returns the alert so the caller can notify the user. */
  triggerAlert(id: string, price: number) {
    const alert = state.alerts.find(item => item.id === id);
    if (!alert || alert.triggeredAt) return undefined;
    const triggered = { ...alert, triggeredAt: Date.now(), triggeredPrice: price };
    commit(withActivity(
      { ...state, alerts: state.alerts.map(item => item.id === id ? triggered : item) },
      log("alerts", `${alert.symbol} moved ${alert.direction} ${money(alert.price)} (now ${money(price)}).`),
    ));
    return triggered;
  },

  toggleReminder(reminder: Reminder) {
    const exists = state.reminders.some(item => item.id === reminder.id);
    commit({ ...state, reminders: exists ? state.reminders.filter(item => item.id !== reminder.id) : [...state.reminders, reminder] });
  },

  reset() {
    commit({ ...state, watchlist: initialPortfolio.watchlist, alerts: [], reminders: [] });
  },
};
