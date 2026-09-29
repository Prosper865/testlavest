// Copy for the Tesla hub. Keep facts general and durable; figures come from the live data feed instead.

export const teslaBusinesses = [
  { id: "vehicles", icon: "car", title: "Electric vehicles", text: "Model 3, Model Y, Model S, Model X, and Cybertruck for consumers, plus the Tesla Semi for freight. Vehicle sales are the largest part of Tesla's revenue." },
  { id: "energy", icon: "battery", title: "Energy storage & solar", text: "Powerwall home batteries, Megapack utility-scale storage, and solar products. A smaller but fast-growing part of the business." },
  { id: "services", icon: "charge", title: "Charging, software & services", text: "The Supercharger network, paid software such as Full Self-Driving (Supervised), servicing, insurance, and used-vehicle sales." },
  { id: "ai", icon: "chip", title: "AI & robotics", text: "Autonomous driving and robotaxi efforts and the Optimus humanoid robot. These are still in development and a major driver of investor expectations." },
] as const;

export const tesla101 = [
  {
    question: "How does Tesla make money?",
    answer: "Mostly by selling vehicles. It also earns from energy storage and solar, from services such as Supercharging, repairs, insurance, and software subscriptions, and from selling regulatory credits to other carmakers. Investors watch vehicle deliveries and profit margins closely because they drive most of the results.",
  },
  {
    question: "What does owning a share of TSLA mean?",
    answer: "A share is a small piece of ownership in Tesla, Inc. Its price is set by buyers and sellers on the Nasdaq exchange, mainly during US market hours (9:30am–4:00pm Eastern). Tesla does not currently pay a dividend, so returns come only from the share price moving, which can go down as well as up.",
  },
  {
    question: "Do I need to buy a whole share?",
    answer: "No. With fractional shares you invest a dollar amount, for example $50, and own that fraction of a share. Your gains or losses are proportional to what you own.",
  },
  {
    question: "What is a recurring buy (dollar-cost averaging)?",
    answer: "You invest the same amount on a schedule, such as $50 every week. You buy more shares when the price is low and fewer when it is high, which smooths out the effect of short-term swings. It does not guarantee a profit or protect against losses.",
  },
  {
    question: "Which dates move the stock?",
    answer: "Quarterly production and delivery numbers (usually published in the first days after each quarter ends), quarterly earnings reports, product and technology events, and the annual shareholder meeting. Prices can move sharply around these announcements.",
  },
  {
    question: "How risky is TSLA?",
    answer: "Tesla is one of the most volatile large US stocks. Daily moves of several percent are common, and it has fallen by more than half from its highs more than once. Holding a single stock concentrates your risk; spreading money across many investments reduces it. Only invest money you can afford to leave invested through big swings.",
  },
];
