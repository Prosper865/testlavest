"use client";

// Client-side demo account. State is kept in localStorage so it survives reloads.
// This is the seam where a real brokerage API (orders, ledger, custody) would plug in.

import { useSyncExternalStore } from "react";
import { getInstrument } from "@/features/market/instruments";
import { getQuotes } from "@/features/market/quotes";
import { roundCents, money, formatAmount, formatPrice, formatShares } from "@/lib/format";
import { createId } from "@/lib/utils";

export type Module = "stocks" | "crypto" | "wallet" | "investments" | "marketplace" | "alerts" | "account";
export type Activity = { id: string; time: number; module: Module; text: string };
export type Frequency = "weekly" | "biweekly" | "monthly";

export type SavingsGoal = { vehicleId: string; vehicleName: string; target: number };

export type RecurringPlan = {
  id: string;
  strategyId: string;
  /** Set for recurring buys: each contribution buys this stock or coin at the current price. */
  asset?: string;
  /** Set for savings goals: contributions build toward a vehicle's price. */
  goal?: SavingsGoal;
  amount: number;
  frequency: Frequency;
  status: "active" | "paused";
  invested: number;
  contributions: number;
  nextRun: number;
  createdAt: number;
};

export type Reservation = { vehicleId: string; deposit: number; time: number };
export type PriceAlert = { id: string; symbol: string; direction: "above" | "below"; price: number; createdAt: number; triggeredAt?: number; triggeredPrice?: number };
export type Reminder = { id: string; title: string; date: number };

export type PortfolioState = {
  version: 1;
  cash: number;
  /** Shares per stock symbol; fractional amounts are allowed. */
  holdings: Record<string, number>;
  crypto: Record<string, number>;
  watchlist: string[];
  plans: RecurringPlan[];
  reservations: Reservation[];
  alerts: PriceAlert[];
  reminders: Reminder[];
  activity: Activity[];
};

export type ActionResult = { ok: boolean; message: string };

const STORAGE_KEY = "aurevia-demo-portfolio";
const DAY = 86_400_000;
const frequencyDays: Record<Frequency, number> = { weekly: 7, biweekly: 14, monthly: 30 };

export const initialPortfolio: PortfolioState = {
  version: 1,
  cash: 12500,
  holdings: { AAPL: 35, NVDA: 60, MSFT: 20 },
  crypto: { BTC: 0.05, ETH: 1.2, SOL: 0 },
  watchlist: ["AAPL", "NVDA", "TSLA"],
  plans: [],
  reservations: [],
  alerts: [],
  reminders: [],
  activity: [],
};

let state = initialPortfolio;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved?.version === 1) state = { ...initialPortfolio, ...saved };
  } catch {
    // Ignore unreadable storage and keep the default account.
  }
}

function commit(next: PortfolioState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode); the session still works in memory.
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
const roundShares = (value: number) => Math.round(value * 1e6) / 1e6;
const capitalize = (text: string) => text.replace(/^./, c => c.toUpperCase());
const goalReached = (plan: RecurringPlan) => Boolean(plan.goal && plan.invested >= plan.goal.target);

type Balances = { holdings: Record<string, number>; crypto: Record<string, number> };

/** One plan contribution. Recurring buys purchase the asset at the latest price; other plans hold cash value. */
function runContribution(plan: RecurringPlan, balances: Balances, prefix = ""): Balances & { entry: Activity } {
  if (plan.goal) return { ...balances, entry: log("marketplace", capitalize(`${prefix}saved ${money(plan.amount)} toward your ${plan.goal.vehicleName}.`)) };
  if (!plan.asset) return { ...balances, entry: log("investments", capitalize(`${prefix}contribution of ${money(plan.amount)} completed.`)) };

  const price = getQuotes()[plan.asset].price;
  const units = plan.amount / price;
  if (getInstrument(plan.asset)?.kind === "stock") {
    return {
      ...balances,
      holdings: { ...balances.holdings, [plan.asset]: roundShares((balances.holdings[plan.asset] ?? 0) + units) },
      entry: log("stocks", capitalize(`${prefix}recurring buy: ${formatShares(units)} ${plan.asset} shares for ${money(plan.amount)}.`)),
    };
  }
  return {
    ...balances,
    crypto: { ...balances.crypto, [plan.asset]: (balances.crypto[plan.asset] ?? 0) + units },
    entry: log("crypto", capitalize(`${prefix}recurring buy: ${formatAmount(units, 8)} ${plan.asset} for ${money(plan.amount)}.`)),
  };
}

export const portfolioActions = {
  tradeStock(symbol: string, side: "Buy" | "Sell", quantity: number, price: number): ActionResult {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return fail("Enter a positive whole number of shares.");
    const cost = roundCents(quantity * price);
    const held = state.holdings[symbol] ?? 0;
    if (side === "Buy" && cost > state.cash) return fail("Not enough demo buying power for this order.");
    if (side === "Sell" && quantity > held + 1e-9) return fail("You do not hold enough shares to sell.");
    const message = `${side === "Buy" ? "Bought" : "Sold"} ${quantity} ${symbol} at ${money(price)} for ${money(cost)}.`;
    commit(withActivity({
      ...state,
      cash: roundCents(state.cash + (side === "Buy" ? -cost : cost)),
      holdings: { ...state.holdings, [symbol]: roundShares(held + (side === "Buy" ? quantity : -quantity)) },
    }, log("stocks", message)));
    return { ok: true, message };
  },

  /** Fractional order sized in dollars, e.g. "$50 of TSLA". */
  tradeStockDollars(symbol: string, side: "Buy" | "Sell", usd: number, price: number): ActionResult {
    if (!(usd >= 1)) return fail("Dollar orders start at $1.");
    const amount = roundCents(usd);
    const held = state.holdings[symbol] ?? 0;
    // Selling (almost) the whole position closes it fully instead of leaving a sliver of a share.
    const sellsAll = side === "Sell" && held > 0 && amount >= held * price - 0.01;
    const shares = sellsAll ? held : roundShares(amount / price);
    if (side === "Buy" && amount > state.cash) return fail("Not enough demo buying power for this order.");
    if (side === "Sell" && shares > held + 1e-6) return fail(`You hold ${formatShares(held)} ${symbol} shares (${money(held * price)}).`);
    const message = `${side === "Buy" ? "Bought" : "Sold"} ${formatShares(shares)} ${symbol} shares at ${money(price)} for ${money(amount)}.`;
    commit(withActivity({
      ...state,
      cash: roundCents(state.cash + (side === "Buy" ? -amount : amount)),
      holdings: { ...state.holdings, [symbol]: Math.max(0, roundShares(held + (side === "Buy" ? shares : -shares))) },
    }, log("stocks", message)));
    return { ok: true, message };
  },

  toggleWatch(symbol: string) {
    const watchlist = state.watchlist.includes(symbol) ? state.watchlist.filter(item => item !== symbol) : [...state.watchlist, symbol];
    commit({ ...state, watchlist });
  },

  addCash(amount: number): ActionResult {
    if (!(amount > 0)) return fail("Enter an amount above zero.");
    const message = `Added ${money(amount)} of demo cash.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash + amount) }, log("account", message)));
    return { ok: true, message };
  },

  depositCrypto(asset: string, amount: number): ActionResult {
    if (!(amount > 0)) return fail("Enter an amount above zero.");
    const message = `Received ${formatAmount(amount)} ${asset} (simulated deposit).`;
    commit(withActivity({ ...state, crypto: { ...state.crypto, [asset]: (state.crypto[asset] ?? 0) + amount } }, log("wallet", message)));
    return { ok: true, message };
  },

  withdrawCrypto(asset: string, amount: number, destination: string): ActionResult {
    const balance = state.crypto[asset] ?? 0;
    if (!(amount > 0)) return fail("Enter an amount above zero.");
    if (amount > balance) return fail(`Your ${asset} balance is ${formatAmount(balance)}.`);
    if (destination.trim().length < 10) return fail("Enter a destination address.");
    const message = `Withdrew ${formatAmount(amount)} ${asset} (simulated, nothing was sent).`;
    commit(withActivity({ ...state, crypto: { ...state.crypto, [asset]: balance - amount } }, log("wallet", message)));
    return { ok: true, message };
  },

  buyCrypto(asset: string, usd: number, price: number): ActionResult {
    if (!(usd >= 1)) return fail("Crypto orders start at $1.");
    if (usd > state.cash) return fail("Not enough demo buying power for this order.");
    const units = usd / price;
    const message = `Bought ${formatAmount(units, 8)} ${asset} at ${formatPrice(price, price < 1 ? 4 : 2)} for ${money(usd)}.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash - usd), crypto: { ...state.crypto, [asset]: (state.crypto[asset] ?? 0) + units } }, log("crypto", message)));
    return { ok: true, message };
  },

  sellCrypto(asset: string, units: number, price: number): ActionResult {
    const balance = state.crypto[asset] ?? 0;
    if (!(units > 0)) return fail("Enter an amount above zero.");
    if (units > balance + 1e-12) return fail(`Your ${asset} balance is ${formatAmount(balance, 8)}.`);
    const proceeds = roundCents(Math.min(units, balance) * price);
    const message = `Sold ${formatAmount(units, 8)} ${asset} at ${formatPrice(price, price < 1 ? 4 : 2)} for ${money(proceeds)}.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash + proceeds), crypto: { ...state.crypto, [asset]: Math.max(0, balance - units) } }, log("crypto", message)));
    return { ok: true, message };
  },

  createPlan(strategyId: string, strategyName: string, amount: number, frequency: Frequency, asset?: string, goal?: SavingsGoal): ActionResult {
    if (!Number.isFinite(amount) || amount < 25) return fail("Recurring contributions start at $25.");
    const now = Date.now();
    const plan: RecurringPlan = { id: createId("plan"), strategyId, asset, goal, amount: roundCents(amount), frequency, status: "active", invested: 0, contributions: 0, nextRun: now, createdAt: now };
    const message = goal
      ? `Started saving ${money(plan.amount)} ${frequency} toward a ${goal.vehicleName}.`
      : asset ? `Started a ${frequency} ${money(plan.amount)} recurring buy of ${strategyName}.` : `Started a ${frequency} ${money(plan.amount)} plan in ${strategyName}.`;
    commit(withActivity({ ...state, plans: [plan, ...state.plans] }, log(goal ? "marketplace" : "investments", message)));
    portfolioActions.processDuePlans();
    return { ok: true, message };
  },

  togglePlan(id: string) {
    commit({ ...state, plans: state.plans.map(plan => plan.id === id ? { ...plan, status: plan.status === "active" ? "paused" : "active" } : plan) });
  },

  removePlan(id: string): ActionResult {
    const plan = state.plans.find(item => item.id === id);
    if (!plan) return fail("Plan not found.");
    // Assets bought by a recurring buy stay in the account; strategy plans and goals return their value to cash.
    const refund = plan.asset ? 0 : plan.invested;
    const message = plan.asset
      ? `Stopped the recurring ${plan.asset} buy; what you bought stays in your account.`
      : plan.goal ? `Closed your ${plan.goal.vehicleName} goal and moved ${money(refund)} to cash.` : `Closed a plan and returned ${money(refund)} to cash.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash + refund), plans: state.plans.filter(item => item.id !== id) }, log(plan.goal ? "marketplace" : "investments", message)));
    return { ok: true, message };
  },

  contribute(id: string): ActionResult {
    const plan = state.plans.find(item => item.id === id);
    if (!plan) return fail("Plan not found.");
    if (goalReached(plan)) return fail("You already reached this goal.");
    if (plan.amount > state.cash) return fail("Not enough demo cash for this contribution.");
    const { holdings, crypto, entry } = runContribution(plan, state);
    commit(withActivity({
      ...state,
      cash: roundCents(state.cash - plan.amount),
      holdings,
      crypto,
      plans: state.plans.map(item => item.id === id ? { ...item, invested: roundCents(item.invested + item.amount), contributions: item.contributions + 1 } : item),
    }, entry));
    return { ok: true, message: entry.text };
  },

  /** Runs every active plan whose next date has passed, as long as cash allows. Reached goals stop automatically. */
  processDuePlans() {
    const now = Date.now();
    let { cash } = state;
    let balances: Balances = { holdings: state.holdings, crypto: state.crypto };
    const entries: Activity[] = [];
    const plans = state.plans.map(plan => {
      const next = { ...plan };
      while (next.status === "active" && next.nextRun <= now && next.amount <= cash && !goalReached(next)) {
        const { entry, ...updated } = runContribution(next, balances, "Automatic ");
        balances = updated;
        cash = roundCents(cash - next.amount);
        next.invested = roundCents(next.invested + next.amount);
        next.contributions += 1;
        next.nextRun += frequencyDays[next.frequency] * DAY;
        entries.push(entry);
        if (goalReached(next)) entries.push(log("marketplace", `Goal reached: you have saved enough for your ${next.goal!.vehicleName}.`));
      }
      return next;
    });
    if (entries.length) commit({ ...state, ...balances, cash, plans, activity: [...entries.reverse(), ...state.activity].slice(0, 60) });
  },

  /** Moves a goal's savings to cash and reserves the vehicle with the deposit. */
  completeGoal(id: string, deposit: number): ActionResult {
    const plan = state.plans.find(item => item.id === id);
    if (!plan?.goal) return fail("Goal not found.");
    const { vehicleId, vehicleName } = plan.goal;
    const cash = roundCents(state.cash + plan.invested);
    if (state.reservations.some(item => item.vehicleId === vehicleId)) return fail("You already reserved this vehicle.");
    if (deposit > cash) return fail("Not enough cash for the reservation deposit.");
    const message = `Moved ${money(plan.invested)} of savings to cash and reserved your ${vehicleName}.`;
    commit(withActivity({
      ...state,
      cash: roundCents(cash - deposit),
      plans: state.plans.filter(item => item.id !== id),
      reservations: [...state.reservations, { vehicleId, deposit, time: Date.now() }],
    }, log("marketplace", message)));
    return { ok: true, message };
  },

  reserveVehicle(vehicleId: string, vehicleName: string, deposit: number): ActionResult {
    if (state.reservations.some(item => item.vehicleId === vehicleId)) return fail("You already reserved this vehicle.");
    if (deposit > state.cash) return fail("Not enough demo cash for the reservation deposit.");
    const message = `Reserved ${vehicleName} with a ${money(deposit)} refundable deposit.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash - deposit), reservations: [...state.reservations, { vehicleId, deposit, time: Date.now() }] }, log("marketplace", message)));
    return { ok: true, message };
  },

  cancelReservation(vehicleId: string, vehicleName: string): ActionResult {
    const reservation = state.reservations.find(item => item.vehicleId === vehicleId);
    if (!reservation) return fail("Reservation not found.");
    const message = `Cancelled the ${vehicleName} reservation; ${money(reservation.deposit)} refunded.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash + reservation.deposit), reservations: state.reservations.filter(item => item.vehicleId !== vehicleId) }, log("marketplace", message)));
    return { ok: true, message };
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
    commit(initialPortfolio);
  },
};
