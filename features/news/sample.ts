import type { NewsTopic } from "./types";

// Shown when no news API key is configured. Clearly labelled as sample content in the UI.
export const sampleNews: { id: string; symbol?: string; topic: NewsTopic; headline: string; summary: string; hoursAgo: number }[] = [
  { id: "n1", symbol: "TSLA", topic: "stocks", headline: "What to watch ahead of Tesla's quarterly delivery update", summary: "Delivery volumes, energy storage deployments, and pricing are the figures investors typically follow.", hoursAgo: 1 },
  { id: "n2", symbol: "NVDA", topic: "stocks", headline: "Data-center demand stays in focus for chipmakers", summary: "Accelerated computing spend remains a key theme across semiconductor earnings calls.", hoursAgo: 2 },
  { id: "n3", topic: "stocks", headline: "Markets open mixed as investors weigh rate expectations", summary: "Equities trade in a narrow range while bond yields hold steady ahead of central bank commentary.", hoursAgo: 3 },
  { id: "n4", symbol: "AAPL", topic: "stocks", headline: "Apple's services segment: why recurring revenue matters", summary: "Subscriptions and app store revenue help smooth the cycle of hardware launches.", hoursAgo: 5 },
  { id: "n5", symbol: "V", topic: "stocks", headline: "Cross-border travel spending and the payments networks", summary: "Travel volumes feed directly into card network revenue from international transactions.", hoursAgo: 7 },
  { id: "n6", symbol: "MSFT", topic: "stocks", headline: "Cloud growth rates: reading the enterprise software cycle", summary: "Infrastructure spend and AI workloads shape the outlook for large cloud platforms.", hoursAgo: 9 },
  { id: "n7", symbol: "AMZN", topic: "stocks", headline: "Retail margins and logistics efficiency under the microscope", summary: "Fulfilment costs and advertising revenue are central to the e-commerce story.", hoursAgo: 12 },
  { id: "n8", symbol: "JPM", topic: "stocks", headline: "Bank earnings season: net interest income explained", summary: "The gap between lending and deposit rates remains a key driver for large banks.", hoursAgo: 20 },
  { id: "c1", symbol: "BTC", topic: "crypto", headline: "Bitcoin supply explained: what the halving cycle means", summary: "New issuance of bitcoin falls by half roughly every four years, a schedule built into the protocol.", hoursAgo: 1 },
  { id: "c2", symbol: "ETH", topic: "crypto", headline: "Ethereum fees and network activity: what to watch", summary: "Transaction fees rise and fall with demand for block space from applications and users.", hoursAgo: 4 },
  { id: "c3", symbol: "SOL", topic: "crypto", headline: "Solana throughput and uptime in focus", summary: "Speed and reliability remain the main themes for high-performance blockchains.", hoursAgo: 6 },
  { id: "c4", topic: "crypto", headline: "Crypto markets trade around the clock: what that means for your orders", summary: "Unlike stock exchanges, crypto markets never close, so prices can move overnight and on weekends.", hoursAgo: 8 },
  { id: "c5", symbol: "XRP", topic: "crypto", headline: "Cross-border payments and digital assets", summary: "Settlement speed and cost are the key comparisons with traditional payment rails.", hoursAgo: 14 },
  { id: "c6", symbol: "DOGE", topic: "crypto", headline: "Why meme coins can move sharply on sentiment", summary: "Community-driven assets often see larger price swings than established cryptocurrencies.", hoursAgo: 22 },
];
