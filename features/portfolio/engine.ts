import { getInstrument } from "@/features/market/instruments";
import { simulationQuotes } from "@/features/market/simulation";
import { roundCents, money, formatAmount, formatPrice, formatShares } from "@/lib/format";
import { createId } from "@/lib/utils";
import { type PortfolioState, type ActionResult, type Activity, type Module, type Frequency, type RecurringPlan, type SavingsGoal } from "./model";

export function createPortfolioEngine(initial: PortfolioState, now = Date.now()) {
let state = structuredClone(initial);
const tradingEnabled = true;
const VERIFY_TO_TRADE = "Verify your identity to trade.";
const DAY = 86_400_000;
const frequencyDays: Record<Frequency, number> = { weekly: 7, biweekly: 14, monthly: 30 };
const getQuotes = () => simulationQuotes(now);
const commit = (next: PortfolioState) => { state = next; };
function log(module: Module, text: string): Activity {
  return { id: createId("act"), time: Date.now(), module, text };
}

function withActivity(next: Omit<PortfolioState, "activity">, entry: Activity): PortfolioState {
  return { ...next, activity: [entry, ...state.activity].slice(0, 60) };
}

const fail = (message: string): ActionResult => ({ ok: false, message });
const roundShares = (value: number) => Math.round(value * 1e12) / 1e12;
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

const portfolioActions = {
  tradeStock(symbol: string, side: "Buy" | "Sell", quantity: number, price: number): ActionResult {
    if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
    if (!Number.isSafeInteger(quantity) || quantity < 1) return fail("Enter a positive whole number of shares.");
    const cost = roundCents(quantity * price);
    const held = state.holdings[symbol] ?? 0;
    if (side === "Buy" && cost > state.cash) return fail("Not enough buying power for this order.");
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
    if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
    if (!(usd >= 1)) return fail("Dollar orders start at $1.");
    let amount = roundCents(usd);
    const held = state.holdings[symbol] ?? 0;
    // Selling (almost) the whole position closes it fully instead of leaving a sliver of a share.
    const sellsAll = side === "Sell" && held > 0 && amount >= held * price - 0.01;
    if (sellsAll) amount = roundCents(held * price);
    const shares = sellsAll ? held : roundShares(amount / price);
    if (side === "Buy" && amount > state.cash) return fail("Not enough buying power for this order.");
    if (side === "Sell" && shares > held + 1e-12) return fail(`You hold ${formatShares(held)} ${symbol} shares (${money(held * price)}).`);
    const message = `${side === "Buy" ? "Bought" : "Sold"} ${formatShares(shares)} ${symbol} shares at ${money(price)} for ${money(amount)}.`;
    commit(withActivity({
      ...state,
      cash: roundCents(state.cash + (side === "Buy" ? -amount : amount)),
      holdings: { ...state.holdings, [symbol]: Math.max(0, roundShares(held + (side === "Buy" ? shares : -shares))) },
    }, log("stocks", message)));
    return { ok: true, message };
  },

  withdrawCrypto(asset: string, amount: number, destination: string): ActionResult {
    if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
    const balance = state.crypto[asset] ?? 0;
    if (!(amount > 0)) return fail("Enter an amount above zero.");
    if (amount > balance) return fail(`Your ${asset} balance is ${formatAmount(balance)}.`);
    if (destination.trim().length < 10) return fail("Enter a destination address.");
    const message = `Withdrew ${formatAmount(amount)} ${asset} (simulated, nothing was sent).`;
    commit(withActivity({ ...state, crypto: { ...state.crypto, [asset]: balance - amount } }, log("wallet", message)));
    return { ok: true, message };
  },

  buyCrypto(asset: string, usd: number, price: number): ActionResult {
    if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
    if (!(usd >= 1)) return fail("Crypto orders start at $1.");
    if (usd > state.cash) return fail("Not enough buying power for this order.");
    usd = roundCents(usd);
    const units = usd / price;
    const message = `Bought ${formatAmount(units, 8)} ${asset} at ${formatPrice(price, price < 1 ? 4 : 2)} for ${money(usd)}.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash - usd), crypto: { ...state.crypto, [asset]: (state.crypto[asset] ?? 0) + units } }, log("crypto", message)));
    return { ok: true, message };
  },

  sellCrypto(asset: string, units: number, price: number): ActionResult {
    if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
    const balance = state.crypto[asset] ?? 0;
    if (!(units > 0)) return fail("Enter an amount above zero.");
    if (units > balance + 1e-12) return fail(`Your ${asset} balance is ${formatAmount(balance, 8)}.`);
    const proceeds = roundCents(Math.min(units, balance) * price);
    const message = `Sold ${formatAmount(units, 8)} ${asset} at ${formatPrice(price, price < 1 ? 4 : 2)} for ${money(proceeds)}.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash + proceeds), crypto: { ...state.crypto, [asset]: Math.max(0, balance - units) } }, log("crypto", message)));
    return { ok: true, message };
  },

  createPlan(strategyId: string, strategyName: string, amount: number, frequency: Frequency, asset?: string, goal?: SavingsGoal): ActionResult {
    if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
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
    if (!tradingEnabled) return fail(VERIFY_TO_TRADE);
    const plan = state.plans.find(item => item.id === id);
    if (!plan) return fail("Plan not found.");
    if (goalReached(plan)) return fail("You already reached this goal.");
    if (plan.amount > state.cash) return fail("Not enough cash for this contribution.");
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
    if (!tradingEnabled) return;
    const now = Date.now();
    let { cash } = state;
    let balances: Balances = { holdings: state.holdings, crypto: state.crypto };
    const entries: Activity[] = [];
    const plans = state.plans.map(plan => {
      const next = { ...plan };
      while (entries.length < 100 && next.status === "active" && next.nextRun <= now && next.amount <= cash && !goalReached(next)) {
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

  /** Reservations can no longer be made; this stays so earlier deposits can still be refunded. */
  cancelReservation(vehicleId: string, vehicleName: string): ActionResult {
    const reservation = state.reservations.find(item => item.vehicleId === vehicleId);
    if (!reservation) return fail("Reservation not found.");
    const message = `Cancelled the ${vehicleName} reservation; ${money(reservation.deposit)} refunded.`;
    commit(withActivity({ ...state, cash: roundCents(state.cash + reservation.deposit), reservations: state.reservations.filter(item => item.vehicleId !== vehicleId) }, log("marketplace", message)));
    return { ok: true, message };
  },


};

return { actions: portfolioActions, getState: () => state };
}
