// Concept portfolios for the automated-investing module. Illustrative allocations, not funds or advice.

export type Strategy = {
  id: string;
  name: string;
  tag: string;
  description: string;
  risk: string;
  allocation: string;
  image: string;
};

export const strategies: Strategy[] = [
  { id: "foundations", name: "Global Foundations", tag: "A world of possibility", description: "Explore a diversified mix of global equities and bonds, designed around a long-term perspective.", risk: "Moderate risk", allocation: "60% equities · 40% bonds", image: "/images/market-screen.jpg" },
  { id: "frontiers", name: "Future Frontiers", tag: "Invest in what comes next", description: "Discover a growth-focused approach to technology, clean energy, and emerging industries.", risk: "Higher risk", allocation: "90% equities · 10% cash", image: "/images/bitcoin-market.jpg" },
  { id: "electric", name: "Electric Future", tag: "Drive the transition", description: "A concept portfolio of electric-vehicle makers, battery and charging companies, and clean-energy producers.", risk: "Higher risk", allocation: "80% EV & clean-energy equities · 20% cash", image: "/images/trading-floor.png" },
  { id: "horizons", name: "Steady Horizons", tag: "Take the measured path", description: "Explore an income-focused mix of bonds and dividend equities with a more measured approach.", risk: "Lower relative risk", allocation: "70% bonds · 20% equities · 10% cash", image: "/images/professionals.jpg" },
];

export function getStrategy(id: string) {
  return strategies.find(strategy => strategy.id === id);
}
