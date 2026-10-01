// Brand and navigation settings. Change the company name and links here.

export const site = {
  name: "Aurevia Capital",
  wordmark: "AUREVIA",
  wordmarkSub: "CAPITAL",
  tagline: "A broader perspective on investing.",
  description: "Automated investing, real-time stocks, a crypto wallet, and a curated Tesla marketplace in one brokerage platform.",
  disclaimer:
    "Aurevia Capital is a working brand for this product prototype. All market prices, charts, portfolios, and allocations are illustrative. No real accounts, deposits, trades, or investment products are offered through this. Investing involves risk, including the loss of capital.",
};

// Fill in once licensed. When set, the "Fully regulated" card shows the regulator and licence number.
export const compliance = {
  regulator: "", // e.g. "Securities and Exchange Commission"
  licenseNumber: "", // e.g. "SEC-12345"
};

export type NavLink = { href: string; label: string };

export const marketingNav: NavLink[] = [
  { href: "/#products", label: "Products" },
  { href: "/tesla", label: "Tesla" },
  { href: "/#asset-markets", label: "Markets" },
  { href: "/#news", label: "News" },
  { href: "/#plans", label: "Account plans" },
  { href: "/#approach", label: "Our approach" },
  { href: "/#learn", label: "Learn" },
];

export const platformNav: NavLink[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/tesla", label: "Tesla" },
  { href: "/investments", label: "Investments" },
  { href: "/stocks", label: "Stocks" },
  { href: "/crypto", label: "Crypto" },
  { href: "/wallet", label: "Wallet" },
  { href: "/marketplace", label: "Marketplace" },
];
