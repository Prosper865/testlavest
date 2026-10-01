// Copy for the public website.

export const heroSlides = [
  { title: "Think bigger.", accent: "Invest beyond.", description: "Stocks. Digital assets. Global currencies. Bring the markets into focus with a new perspective on investing.", category: "01 / GLOBAL MARKETS" },
  { title: "Follow the markets.", accent: "Find your edge.", description: "Discover the companies shaping tomorrow. Explore stock performance, build your watchlist, and practice your next move.", category: "02 / STOCKS & EQUITIES" },
  { title: "Explore digital.", accent: "Stay ahead.", description: "Get a clearer view of Bitcoin, Ethereum, and the digital asset landscape. Your next chapter starts with understanding.", category: "03 / DIGITAL ASSETS" },
];

export const products = [
  { href: "/investments", title: "Investments", label: "Automated", description: "Flexible plans, recurring contributions.", icon: "plan" },
  { href: "/stocks", title: "Stocks", label: "Realtime", description: "Quotes, news, and watchlists.", icon: "chart" },
  { href: "/wallet", title: "Wallet", label: "Crypto", description: "Deposit and withdraw easily.", icon: "wallet" },
  { href: "/marketplace", title: "Marketplace", label: "Tesla", description: "Curated EV selection.", icon: "car" },
] as const;

export const advantages = [
  { id: "expert", title: "Expert service", description: "We provide expert services for all trades.", icon: "expert", image: "/images/trading-floor.png", alt: "Market specialists working at trading screens", layout: "wide" },
  { id: "regulated", title: "Fully regulated", description: "Our services are fully regulated.", icon: "shield", layout: "feature" },
  { id: "strength", title: "Financial strength", description: "Strong financial strength behind every account.", icon: "strength", image: "/images/market-screen.jpg", alt: "Market charts on trading screens", layout: "narrow" },
  { id: "support", title: "Integrated support", description: "We offer frequent support for all services.", icon: "support", image: "/images/professionals.jpg", alt: "Team collaborating around a table", layout: "wide" },
] as const;

export const accountOpportunities = ["Stocks", "Crypto 24/7", "Automated plans", "Tesla marketplace"];

// Placeholder reviews for the preview. Replace with verified customer reviews (with their consent)
// and set `testimonialsArePreview` to false. `photo` may point to a consented customer photo in /public.
export const testimonialsArePreview = true;

export type Testimonial = { name: string; location: string; product: string; rating: number; quote: string; photo?: string };

export const testimonials: Testimonial[] = [
  { name: "Amara O.", location: "London, UK", product: "Crypto", rating: 5, quote: "Setting up a weekly Bitcoin buy took two minutes. I stopped trying to time the market and just stay consistent." },
  { name: "Daniel K.", location: "Manchester, UK", product: "Stocks", rating: 5, quote: "The charts feel like a real trading terminal, and I can go from a headline to a trade without leaving the page." },
  { name: "Sofia R.", location: "New York, US", product: "Automated plans", rating: 4, quote: "I picked a strategy, chose a monthly amount, and it runs on its own. Pausing it when I needed to was easy." },
  { name: "James T.", location: "Austin, US", product: "Marketplace", rating: 5, quote: "Reserving a Model Y from the same account I invest with was a surprise. Everything in one place." },
];

export const principles = [
  ["01", "See the bigger picture", "Bring your holdings, watchlist, and investment ideas into a single, considered workspace."],
  ["02", "Make room for your goals", "Explore different investment approaches, from growth-focused stocks to diversified portfolio concepts."],
  ["03", "Move with understanding", "Practice with funds before making real decisions. Clear information, at every step."],
] as const;

export const faqs = [
  ["What can I do?", "Explore simulated stock and crypto prices, build a watchlist, practice trading shares, set up recurring investment plans, move crypto in a wallet, and reserve vehicles in the marketplace. Nothing here places real trades or moves real money. Your account is saved in this browser and can be reset at any time."],
  ["How do the investment strategies work?", "Our three concept portfolios illustrate different mixes of assets and levels of risk. They are examples for exploring the interface, not active funds, guaranteed returns, or personalized investment advice."],
  ["Is the platform available in my country?", "This preview can be explored globally. Real account opening, trading, deposits, and managed investments are not available yet. Future availability will depend on the country and financial providers supporting the service."],
] as const;
