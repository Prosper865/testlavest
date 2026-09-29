# Aurevia Capital

An investment broker platform prototype built with Next.js 16.3.6, React 19, TypeScript, and CSS Modules (Tailwind CSS 4 is available).

## Run locally

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000 for the public website and http://localhost:3000/dashboard for the platform.

## Live market news

Headlines come from [Finnhub](https://finnhub.io) (free tier). Copy `.env.example` to `.env.local`, add `FINNHUB_API_KEY`, and restart the dev server. Without a key, clearly labelled sample headlines are shown. The key is only read on the server (`features/news/get-news.ts`) and responses are cached for 10 minutes.

## Product modules

| Module | Route | What it does |
| --- | --- | --- |
| Investments · Automated | `/investments` | Recurring plans into concept strategies; contributions run automatically on schedule |
| Stocks · Realtime | `/stocks`, `/stocks/[symbol]` | Simulated live quotes, watchlist, sample news, buy/sell ticket |
| Tesla hub | `/tesla` | TSLA trading (whole or fractional), recurring buys, price alerts, real company data and key dates (Finnhub), Tesla news, "Save for your Tesla" goals, Tesla 101 |
| Crypto · 24/7 | `/crypto`, `/crypto/[symbol]` | Trading chart, fractional buy/sell from $1, recurring buys (dollar-cost averaging), crypto news |
| Wallet · Transfers | `/wallet` | Crypto balances, simulated deposit and withdrawal, demo cash top-ups |
| Marketplace · Tesla | `/marketplace` | Curated new and pre-owned EV listings with refundable reservations |
| Overview | `/dashboard` | Total value, allocation, holdings, and activity across all modules |

## Folder structure

```
app/                     Routing only; pages compose feature components
  (marketing)/           Public website
  (platform)/            Broker app with shared header and layout
components/
  ui/                    Buttons, headings, panels, segmented controls, form fields
  layout/                Brand, site header/footer, platform header
  charts/                Line chart, sparkline, trend line
features/<module>/       One folder per business module: data, logic, components, index.ts
  market/                Instruments, simulated quotes and price history, shared chart, terminal, quote panel
  portfolio/             Account store (cash, holdings, crypto, plans, reservations, activity)
  tesla/                 Tesla hub: Finnhub company data, key dates, education content
  alerts/                Price alerts, alert watcher, reminder banner
  news/                  Finnhub news (server-only) with sample fallback
  investments/ stocks/ crypto/ wallet/ marketplace/ marketing/
config/site.ts           Company name, navigation, disclaimer
lib/                     Formatting and small utilities
styles/                  Design tokens and base element styles
```

Rules of thumb: routes stay thin; features import from `components/` and `lib/`, and from each other only through the `market` and `portfolio` modules; each component keeps its styles in a colocated `*.module.css`.

## Demo boundaries

Prices tick from a simulated random walk and are not market data. The account lives in the browser (localStorage) and can be reset from any platform page. There are no user accounts, payments, custody, real orders, or database.

Before offering real services the product needs authentication, persistent accounts, licensed market data and news, a brokerage/custody provider, order and cash ledgers, KYC, and country-specific availability. The seams for these are `features/market/quotes.ts` (market data) and `features/portfolio/store.ts` (account actions).

Tesla and other company marks identify instruments and products and do not imply affiliation. See ASSETS.md for image and logo sources.

## Checks

```bash
pnpm lint
pnpm build
```
