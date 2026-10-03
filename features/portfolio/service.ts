import { and, desc, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/types";
import { z } from "zod";
import * as schema from "@/lib/db/schema";
import { lockUser, withdrawalBalance } from "@/features/withdrawals/service";
import { CLOSED_MESSAGE, getInstrument } from "@/features/market/instruments";
import { simulationQuotes } from "@/features/market/simulation";
import { getStrategy } from "@/features/investments/strategies";
import { vehicleName } from "@/features/marketplace/vehicles";
import { createPortfolioEngine } from "./engine";
import { initialPortfolio, type ActionResult, type PortfolioState } from "./model";

export class PortfolioError extends Error {}
const name = z.string().min(1).max(100);
const amount = z.number().finite().positive().max(100_000_000);
const dollars = amount.refine(value => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001, "Use no more than two decimal places.");
const side = z.enum(["Buy", "Sell"]);
export const portfolioRequest = z.object({ id: z.uuid(), command: name, args: z.array(z.unknown()).max(5) });

/** The server chooses prices and catalogue data; no client-supplied balance is trusted. */
export async function transactPortfolio(db: Database, userId: string, raw: unknown) {
  const input = portfolioRequest.parse(raw);
  return db.transaction(async tx => {
    await lockUser(tx, userId);
    const user = await tx.query.users.findFirst({ where: and(eq(schema.users.id, userId), eq(schema.users.status, "active")) });
    if (!user) throw new PortfolioError("Your account is unavailable.");
    const kyc = await tx.query.kycSubmissions.findFirst({ where: eq(schema.kycSubmissions.userId, userId), orderBy: desc(schema.kycSubmissions.submittedAt) });
    if (user.role !== "admin" && kyc?.status !== "approved") throw new PortfolioError("Verify your identity to trade. Open Account → Verify identity.");
    const previous = await tx.query.portfolioTransactions.findFirst({ where: eq(schema.portfolioTransactions.id, input.id) });
    if (previous) {
      if (previous.userId !== userId || previous.command !== input.command) throw new PortfolioError("Invalid transaction request.");
      return { ok: true, message: previous.message };
    }
    const balance = await withdrawalBalance(tx, userId);
    const saved = user.portfolioJson ? JSON.parse(user.portfolioJson) as Partial<PortfolioState> : {};
    const now = Date.now();
    const engine = createPortfolioEngine({ ...initialPortfolio, ...saved, cash: balance.availableCents / 100 }, now);
    const actions = engine.actions;
    const quotes = simulationQuotes(now);
    const instrument = (symbol: string, kind: "stock" | "crypto") => {
      if (getInstrument(symbol)?.kind !== kind) throw new PortfolioError("Choose a supported asset.");
      return quotes[symbol].price;
    };
    let result: ActionResult | undefined;
    switch (input.command) {
      case "tradeStock": {
        const [symbol, orderSide, quantity] = z.tuple([name, side, z.number().int().positive().max(100_000_000)]).parse(input.args);
        result = actions.tradeStock(symbol, orderSide, quantity, instrument(symbol, "stock")); break;
      }
      case "tradeStockDollars": {
        const [symbol, orderSide, usd] = z.tuple([name, side, dollars.min(1)]).parse(input.args);
        result = actions.tradeStockDollars(symbol, orderSide, usd, instrument(symbol, "stock")); break;
      }
      // Crypto is closed. Selling stays available so existing balances can still be turned back into cash.
      case "buyCrypto": case "withdrawCrypto":
        throw new PortfolioError(`Crypto is not available. ${CLOSED_MESSAGE}`);
      case "sellCrypto": {
        const [symbol, units] = z.tuple([name, amount]).parse(input.args);
        result = actions.sellCrypto(symbol, units, instrument(symbol, "crypto")); break;
      }
      case "createPlan": {
        const [strategyId, usd, frequency, asset, goalId] = z.tuple([name, dollars.min(25), z.enum(["weekly", "biweekly", "monthly"]), name.nullable(), name.nullable()]).parse(input.args);
        if (usd > balance.availableCents / 100) throw new PortfolioError("Not enough available balance for the first contribution.");
        if (engine.getState().plans.length >= 100) throw new PortfolioError("Close an existing plan before adding another.");
        if (goalId) {
          const vehicle = await tx.query.vehicles.findFirst({ where: eq(schema.vehicles.id, goalId) });
          if (!vehicle?.visible || asset) throw new PortfolioError("Choose a supported savings goal.");
          result = actions.createPlan(`goal:${vehicle.id}`, vehicleName(vehicle), usd, frequency, undefined, { vehicleId: vehicle.id, vehicleName: vehicleName(vehicle), target: vehicle.price });
        } else if (asset) {
          const item = getInstrument(asset);
          if (!item) throw new PortfolioError("Choose a supported asset.");
          if (item.kind !== "stock") throw new PortfolioError(`This asset is not available. ${CLOSED_MESSAGE}`);
          result = actions.createPlan(`asset:${asset}`, item.name, usd, frequency, asset);
        } else {
          const strategy = getStrategy(strategyId);
          if (!strategy) throw new PortfolioError("Choose a supported investment strategy.");
          result = actions.createPlan(strategy.id, strategy.name, usd, frequency);
        }
        break;
      }
      case "contribute": case "removePlan": case "togglePlan": {
        const [id] = z.tuple([name]).parse(input.args);
        if (!engine.getState().plans.some(plan => plan.id === id)) throw new PortfolioError("Plan not found.");
        if (input.command === "togglePlan") { actions.togglePlan(id); result = { ok: true, message: "Plan updated." }; }
        else result = actions[input.command](id);
        break;
      }
      case "processDuePlans":
        z.tuple([]).parse(input.args);
        actions.processDuePlans();
        result = { ok: true, message: "Scheduled contributions checked." }; break;
      case "cancelReservation": {
        // Reservations can no longer be made, but earlier deposits stay refundable, even if the listing was removed.
        const [id] = z.tuple([name]).parse(input.args);
        const vehicle = await tx.query.vehicles.findFirst({ where: eq(schema.vehicles.id, id) });
        result = actions.cancelReservation(id, vehicle ? vehicleName(vehicle) : "removed listing");
        break;
      }
      default: throw new PortfolioError("Unsupported account transaction.");
    }
    if (!result?.ok) throw new PortfolioError(result?.message ?? "Transaction failed.");
    const next = engine.getState();
    const remainingCents = Math.round(next.cash * 100);
    if (!Number.isSafeInteger(remainingCents) || remainingCents < 0) throw new PortfolioError("Not enough available balance.");
    const spentCents = user.portfolioSpentCents + balance.availableCents - remainingCents;
    const { holdings, crypto: coins, plans, reservations, activity } = next;
    const portfolioJson = JSON.stringify({ holdings, crypto: coins, plans, reservations, activity });
    if (input.command === "processDuePlans" && portfolioJson === user.portfolioJson) return result;
    await tx.update(schema.users).set({ portfolioSpentCents: spentCents, portfolioJson, portfolioVersion: user.portfolioVersion + 1 }).where(eq(schema.users.id, userId));
    await tx.insert(schema.portfolioTransactions).values({ id: input.id, userId, command: input.command, message: result.message, createdAt: new Date() });
    await tx.insert(schema.auditLog).values({ id: crypto.randomUUID(), actorId: userId, targetUserId: userId, action: `portfolio.${input.command}`, detail: result.message, createdAt: new Date() });
    return result;
  });
}
