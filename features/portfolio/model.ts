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
  /** Total virtual USD added through the demo deposit flow. */
  deposits: number;
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

export const initialPortfolio: PortfolioState = {
  version: 1,
  cash: 0,
  deposits: 0,
  holdings: {},
  crypto: {},
  watchlist: ["AAPL", "NVDA", "TSLA"],
  plans: [],
  reservations: [],
  alerts: [],
  reminders: [],
  activity: [],
};

