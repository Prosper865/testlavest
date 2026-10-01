# Teslavest

An investment broker platform prototype built with Next.js 16.3.6, React 19, TypeScript, and CSS Modules (Tailwind CSS 4 is available).

## Run locally

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000 for the public website and http://localhost:3000/dashboard for the mobile investing app.

## Accounts, KYC, and admin

- **Sign up / log in** at `/signup` and `/login`. Passwords are hashed with bcrypt; sessions are signed JWT cookies (httpOnly). `proxy.ts` redirects at the door and every page, server action, and route handler re-checks the user through `lib/auth/dal.ts`.
- **Identity verification (simulated KYC)** at `/verify`: a four-step form with ID and selfie upload. Files are stored privately in `storage/kyc/` (never in `public/`) and served only to admins or the owner via `/api/kyc/[id]/[file]`. Only the last 4 characters of the ID number are stored. Trading, deposits, and plans unlock once an admin approves.
- **Admin console** at `/admin`: overview stats, KYC review queue (approve / reject with a note the user sees), users (search, filter, suspend, grant admin), and an activity log.

First-time setup:

```bash
cp .env.example .env.local   # then set SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
pnpm admin:create            # creates (or resets) the admin account
```

Data lives in Postgres: set `DATABASE_URL` in `.env.local`. Migrations in `migrations/` apply automatically on first use. After changing `lib/db/schema.ts`, run `pnpm db:generate`. For production, also move KYC files to private object storage (S3/R2), because a serverless host's filesystem is not persistent.

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
| Mobile app | `/dashboard` | Phone-first Home, Markets, Trade, Wallet, and Profile screens, plus Deposit, Buy stock, Invest, Card, and Withdraw actions. Home shows demo deposit, investment, and profit totals. |

## Folder structure

```
app/                     Routing only; pages compose feature components
  (marketing)/           Public website
  (mobile)/              Mobile investing app at /dashboard
  (platform)/            Broker app with shared header and layout
components/
  ui/                    Buttons, headings, panels, segmented controls, form fields
  layout/                Brand, site header/footer, platform header
  charts/                Line chart, sparkline, trend line
features/<module>/       One folder per business module: data, logic, components, index.ts
  market/                Instruments, simulated quotes and price history, shared chart, terminal, quote panel
  portfolio/             Account store (cash, holdings, crypto, plans, reservations, activity)
  mobile-app/            Phone-first app shell, core screens, investment plan form, and card preview
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

Prices are simulated, with the server determining each order's price. Demo accounts start at $0.00. Approved deposits and individually assigned admin profit fund purchases. Stocks, crypto, recurring contributions, and vehicle reservations debit the same saved balance; sales and reservation refunds credit it. Pending withdrawals reserve funds, and marking a withdrawal sent deducts them. Holdings and cash changes are saved together in the database for each user. Total account value includes holdings; available cash excludes invested funds and pending withdrawals. Watchlists, alerts, and reminders remain browser preferences, and resetting preferences does not erase balances. Earlier browser-only practice balances are not accepted as account funds. All money, trades, identity checks, and card features are demonstrations; no real transfer, custody, brokerage order, or card issuance occurs.

Run `pnpm test:portfolio` to verify purchase debits, sales, user isolation, duplicate requests, withdrawal reservations, recurring contributions, refunds, and transaction rollback. Database migrations are applied automatically on access.

Before offering real services the product needs authentication, persistent accounts, licensed market data and news, a brokerage/custody provider, order and cash ledgers, KYC, and country-specific availability. The seams for these are `features/market/quotes.ts` (market data) and `features/portfolio/store.ts` (account actions).

Tesla and other company marks identify instruments and products and do not imply affiliation. See ASSETS.md for image and logo sources.

## Checks

```bash
pnpm lint
pnpm build
```
