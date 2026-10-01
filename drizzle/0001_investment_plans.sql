CREATE TABLE `investment_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tagline` text NOT NULL,
	`min_investment` integer NOT NULL,
	`max_investment` integer,
	`duration` text NOT NULL,
	`withdrawals` text NOT NULL,
	`risk_level` text NOT NULL,
	`expected_return` text NOT NULL,
	`fee` text NOT NULL,
	`features` text NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `plans_order_idx` ON `investment_plans` (`sort_order`);--> statement-breakpoint
INSERT INTO `investment_plans` (`id`, `name`, `tagline`, `min_investment`, `max_investment`, `duration`, `withdrawals`, `risk_level`, `expected_return`, `fee`, `features`, `featured`, `visible`, `sort_order`, `created_at`, `updated_at`) VALUES
('7b3f1c2e-0000-4a00-8000-000000000001', 'Starter', 'A simple, diversified first step into the markets.', 100, 5000, 'Flexible, no lock-up', 'Anytime', 'low', '4–6% a year', '0.25% a year', '["Diversified global ETF portfolio","Automatic rebalancing","Recurring deposits from $25","Cancel anytime"]', 0, 1, 1, strftime('%s','now') * 1000, strftime('%s','now') * 1000),
('7b3f1c2e-0000-4a00-8000-000000000002', 'Growth', 'Stocks-focused portfolio for long-term growth.', 5000, 50000, '12 months recommended', 'Monthly', 'moderate', '6–9% a year', '0.40% a year', '["80% equities, 20% bonds","Quarterly performance reports","Tax-efficient rebalancing","Priority support"]', 1, 1, 2, strftime('%s','now') * 1000, strftime('%s','now') * 1000),
('7b3f1c2e-0000-4a00-8000-000000000003', 'Tesla & EV Focus', 'Concentrated exposure to Tesla and the EV supply chain.', 1000, 100000, '3+ years recommended', 'Anytime', 'high', 'Varies widely (volatile)', '0.50% a year', '["Tesla plus EV, battery and charging stocks","Fractional shares from $1","Key-date alerts for deliveries and earnings","Single-sector risk: expect large swings"]', 0, 1, 3, strftime('%s','now') * 1000, strftime('%s','now') * 1000),
('7b3f1c2e-0000-4a00-8000-000000000004', 'Premium', 'Managed portfolio with a dedicated account manager.', 50000, NULL, '12 months minimum', 'On request (5 business days)', 'moderate', '5–8% a year', '0.75% a year', '["Custom allocation across stocks, bonds and crypto","Dedicated account manager","Consolidated reporting","Personal onboarding"]', 0, 1, 4, strftime('%s','now') * 1000, strftime('%s','now') * 1000);
