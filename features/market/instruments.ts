// Instrument catalogue. Starting prices were refreshed from Finnhub on 2026-09-29; the demo simulates
// movement from there. Forex prices are illustrative (not on the free Finnhub plan).
// Replace this module with a market-data provider when real quotes are licensed.
// Logos: stocks render from Simple Icons (see logos.ts); coins and flags are SVGs in /public.

export type InstrumentKind = "stock" | "crypto" | "forex";
export type StockSector = "Technology" | "Communication" | "Finance" | "Consumer" | "Industrials" | "Pre-IPO";

export type Instrument = {
  symbol: string;
  name: string;
  kind: InstrumentKind;
  /** Reference price the simulation starts from. */
  price: number;
  /** Daily change in percent at the reference price. */
  change: number;
  decimals: number;
  sector?: StockSector;
  /** Local SVG in /public (coins). */
  logo?: string;
  /** Flag codes for a forex pair, e.g. ["eu", "us"]. */
  flags?: [string, string];
  about?: string;
};

const stock = (symbol: string, name: string, price: number, change: number, sector: StockSector, about: string): Instrument =>
  ({ symbol, name, kind: "stock", price, change, decimals: 2, sector, about });

// Privately held companies: no public shares exist, so the ticker, price, and trading are simulated for the demo.
const preIpo = (symbol: string, name: string, price: number, change: number, logo: string, about: string): Instrument =>
  ({ symbol, name, kind: "stock", price, change, decimals: 2, sector: "Pre-IPO", logo, about: `${about} Privately held: there are no public shares, so this price and trading are simulated for the demo.` });

const coin = (symbol: string, name: string, price: number, change: number, about: string): Instrument =>
  ({ symbol, name, kind: "crypto", price, change, decimals: price < 1 ? 4 : 2, logo: `/logos/crypto/${symbol.toLowerCase()}.svg`, about });

const pair = (symbol: string, name: string, price: number, change: number, flags: [string, string]): Instrument =>
  ({ symbol, name, kind: "forex", price, change, decimals: price > 20 ? 2 : 4, flags });

export const stocks: Instrument[] = [
  stock("TSLA", "Tesla", 354.4, -0.85, "Consumer", "Electric vehicles, energy storage, and solar products."),
  preIpo("SPACEX", "SpaceX", 185.4, 1.12, "/logos/companies/spacex.svg", "Reusable rockets, spacecraft, and the Starlink satellite network."),
];

export const cryptoAssets: Instrument[] = [
  coin("BTC", "Bitcoin", 83648, -0.22, "The first decentralized digital currency, with a fixed maximum supply of 21 million coins."),
  coin("ETH", "Ethereum", 2698.33, 0.25, "A programmable blockchain for smart contracts and decentralized applications."),
  coin("SOL", "Solana", 119.38, -0.03, "A high-throughput blockchain focused on fast, low-cost transactions."),
  coin("BNB", "BNB", 756.09, -1.58, "The native token of the BNB Chain ecosystem."),
  coin("XRP", "XRP", 1.5024, -0.1, "A digital asset designed for fast cross-border payments and settlement."),
  coin("ADA", "Cardano", 0.2457, -1.01, "A proof-of-stake blockchain developed through peer-reviewed research."),
  coin("DOGE", "Dogecoin", 0.09439, -0.1, "A community-driven cryptocurrency originally created as a lighthearted alternative."),
  coin("AVAX", "Avalanche", 11.323, 8.29, "A smart-contract platform built around fast-finality subnets."),
  coin("DOT", "Polkadot", 1.192, 0.93, "A network connecting multiple specialized blockchains."),
  coin("LINK", "Chainlink", 14.64, -3.4, "A decentralized oracle network bringing outside data on-chain."),
  coin("LTC", "Litecoin", 67.61, -2.5, "An early Bitcoin fork with faster block times."),
  coin("MATIC", "Polygon", 0.3794, 0, "Scaling technology for Ethereum applications."),
  coin("TRX", "TRON", 0.3355, -0.24, "A blockchain widely used for stablecoin transfers."),
  coin("XLM", "Stellar", 0.2233, -3.75, "An open network for payments and asset issuance."),
];

export const forexPairs: Instrument[] = [
  pair("EUR/USD", "Euro / US Dollar", 1.0842, 0.12, ["eu", "us"]),
  pair("GBP/USD", "Pound / US Dollar", 1.2718, -0.08, ["gb", "us"]),
  pair("USD/JPY", "US Dollar / Yen", 149.62, 0.24, ["us", "jp"]),
  pair("AUD/USD", "Australian Dollar / US Dollar", 0.6721, 0.31, ["au", "us"]),
  pair("USD/CAD", "US Dollar / Canadian Dollar", 1.3542, -0.15, ["us", "ca"]),
  pair("USD/CHF", "US Dollar / Swiss Franc", 0.8512, 0.09, ["us", "ch"]),
];

/** Only stocks (Tesla and SpaceX) are open for trading right now. Crypto and forex are shown but inactive. */
export const CLOSED_MESSAGE = "Only Tesla and SpaceX are open for trading right now.";
export const isOpenForTrading = (item: Pick<Instrument, "kind">) => item.kind === "stock";

export const instruments = [...stocks, ...cryptoAssets, ...forexPairs];
export const stockSectors = [...new Set(stocks.map(item => item.sector).filter((sector): sector is StockSector => Boolean(sector)))];

const bySymbol = new Map(instruments.map(item => [item.symbol, item]));

export function getInstrument(symbol: string) {
  return bySymbol.get(symbol.toUpperCase());
}

export function getStock(symbol: string) {
  const item = getInstrument(symbol);
  return item?.kind === "stock" ? item : undefined;
}

export function getCrypto(symbol: string) {
  const item = getInstrument(symbol);
  return item?.kind === "crypto" ? item : undefined;
}

/** Route for an instrument's detail page, if it has one. */
export function instrumentHref(item: Instrument) {
  return item.kind === "stock" ? `/stocks/${item.symbol}` : item.kind === "crypto" ? `/crypto/${item.symbol}` : undefined;
}
