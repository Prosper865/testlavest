CREATE TABLE `payment_methods` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `network` text NOT NULL,
  `address` text DEFAULT '' NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `payment_methods` (`id`, `name`, `network`, `address`, `updated_at`) VALUES
('acd20830-5f94-4565-81b0-2f6946a3c001', 'Bitcoin', 'Bitcoin', '', 1790762001680),
('acd20830-5f94-4565-81b0-2f6946a3c002', 'Ethereum', 'Ethereum (ERC-20)', '', 1790762001680),
('acd20830-5f94-4565-81b0-2f6946a3c003', 'USDT', 'Tron (TRC-20)', '', 1790762001680),
('acd20830-5f94-4565-81b0-2f6946a3c004', 'USDT', 'Ethereum (ERC-20)', '', 1790762001680);
