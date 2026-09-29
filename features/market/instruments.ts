// Instrument catalogue. Starting prices were refreshed from Finnhub on 2026-09-29; the demo simulates
// movement from there. Forex prices are illustrative (not on the free Finnhub plan).
// Replace this module with a market-data provider when real quotes are licensed.
// Logos: stocks render from Simple Icons (see logos.ts); coins and flags are SVGs in /public.

export type InstrumentKind = "stock" | "crypto" | "forex";
export type StockSector = "Technology" | "Communication" | "Finance" | "Consumer" | "Industrials";

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

const coin = (symbol: string, name: string, price: number, change: number, about: string): Instrument =>
  ({ symbol, name, kind: "crypto", price, change, decimals: price < 1 ? 4 : 2, logo: `/logos/crypto/${symbol.toLowerCase()}.svg`, about });

const pair = (symbol: string, name: string, price: number, change: number, flags: [string, string]): Instrument =>
  ({ symbol, name, kind: "forex", price, change, decimals: price > 20 ? 2 : 4, flags });

export const stocks: Instrument[] = [
  stock("TSLA", "Tesla", 354.4, -0.85, "Consumer", "Electric vehicles, energy storage, and solar products."),
  stock("AAPL", "Apple Inc.", 330.76, -2.26, "Technology", "Consumer devices, software, and services."),
  stock("NVDA", "NVIDIA", 228.37, -0.21, "Technology", "Accelerated computing and graphics processors."),
  stock("MSFT", "Microsoft", 510.65, 0.28, "Technology", "Cloud platforms, productivity software, and devices."),
  stock("GOOGL", "Alphabet (Google)", 340.87, -0.55, "Communication", "Search, advertising, cloud, and the Android and YouTube platforms."),
  stock("META", "Meta Platforms", 733.57, 2.51, "Communication", "Social apps including Facebook, Instagram, and WhatsApp."),
  stock("NFLX", "Netflix", 70.46, 1.78, "Communication", "Subscription streaming entertainment."),
  stock("AMD", "AMD", 609.68, 0.3, "Technology", "Processors and graphics chips for PCs, consoles, and data centers."),
  stock("INTC", "Intel", 116.13, 0.09, "Technology", "Semiconductor design and manufacturing."),
  stock("SHOP", "Shopify", 148.51, 3.12, "Technology", "Commerce software for online and in-person merchants."),
  stock("V", "Visa", 367.32, -0.11, "Finance", "Global card payments network."),
  stock("MA", "Mastercard", 565.04, -0.57, "Finance", "Global payments technology and card network."),
  stock("PYPL", "PayPal", 53.88, -0.74, "Finance", "Digital payments and wallets, including Venmo."),
  stock("COIN", "Coinbase", 189.71, -1.08, "Finance", "Cryptocurrency exchange and custody platform."),
  stock("UBER", "Uber", 69.63, 2.16, "Consumer", "Ride-hailing, delivery, and freight marketplaces."),
  stock("ABNB", "Airbnb", 157.62, 0.99, "Consumer", "Marketplace for short-term stays and experiences."),
  stock("TM", "Toyota", 186.73, -0.83, "Consumer", "Automaker spanning hybrids, EVs, and conventional vehicles."),
  stock("NKE", "Nike", 35.82, -1.57, "Consumer", "Athletic footwear, apparel, and equipment."),
  stock("SBUX", "Starbucks", 95.49, 0.23, "Consumer", "Coffeehouse chain and consumer packaged coffee."),
  stock("MCD", "McDonald's", 234.49, 0.38, "Consumer", "Global quick-service restaurant franchisor."),
  stock("KO", "Coca-Cola", 86.88, -0.34, "Consumer", "Beverages including soft drinks, water, and coffee."),
  stock("SPOT", "Spotify", 493.71, -0.76, "Communication", "Audio streaming for music and podcasts."),
  stock("BA", "Boeing", 188.19, 2.06, "Industrials", "Commercial aircraft, defense, and space systems."),
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

export const instruments = [...stocks, ...cryptoAssets, ...forexPairs];
export const stockSectors: StockSector[] = ["Technology", "Communication", "Finance", "Consumer", "Industrials"];

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
