CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"target_user_id" text,
	"detail" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"min_investment" integer NOT NULL,
	"max_investment" integer,
	"duration" text NOT NULL,
	"withdrawals" text NOT NULL,
	"risk_level" text NOT NULL,
	"expected_return" text NOT NULL,
	"fee" text NOT NULL,
	"features" jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"legal_name" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"nationality" text NOT NULL,
	"phone" text NOT NULL,
	"address_line" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"occupation" text NOT NULL,
	"source_of_funds" text NOT NULL,
	"document_type" text NOT NULL,
	"document_last4" text NOT NULL,
	"document_file" text NOT NULL,
	"selfie_file" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"network" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text,
	"plan_name" text NOT NULL,
	"amount" integer NOT NULL,
	"method_name" text NOT NULL,
	"network" text NOT NULL,
	"address" text NOT NULL,
	"screenshot" "bytea" NOT NULL,
	"screenshot_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "portfolio_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"command" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"profit_cents" bigint DEFAULT 0 NOT NULL,
	"portfolio_spent_cents" bigint DEFAULT 0 NOT NULL,
	"portfolio_version" integer DEFAULT 0 NOT NULL,
	"portfolio_json" text,
	"created_at" timestamp with time zone NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount_cents" bigint NOT NULL,
	"beneficiary_name" text NOT NULL,
	"account_number" text NOT NULL,
	"routing_number" text NOT NULL,
	"recipient_address" text NOT NULL,
	"bank_address" text NOT NULL,
	"bank_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"review_note" text
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_payments" ADD CONSTRAINT "plan_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_payments" ADD CONSTRAINT "plan_payments_plan_id_investment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."investment_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_payments" ADD CONSTRAINT "plan_payments_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "plans_order_idx" ON "investment_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "kyc_user_idx" ON "kyc_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "kyc_status_idx" ON "kyc_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "plan_payments_user_idx" ON "plan_payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plan_payments_status_idx" ON "plan_payments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_payments_pending_idx" ON "plan_payments" USING btree ("user_id","plan_id") WHERE "plan_payments"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "portfolio_transaction_user_idx" ON "portfolio_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "withdrawals_user_idx" ON "withdrawals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");--> statement-breakpoint
INSERT INTO "investment_plans" ("id", "name", "tagline", "min_investment", "max_investment", "duration", "withdrawals", "risk_level", "expected_return", "fee", "features", "featured", "visible", "sort_order", "created_at", "updated_at") VALUES
('7b3f1c2e-0000-4a00-8000-000000000001', 'Starter', 'A simple, diversified first step into the markets.', 100, 5000, 'Flexible, no lock-up', 'Anytime', 'low', '4–6% a year', '0.25% a year', '["Diversified global ETF portfolio","Automatic rebalancing","Recurring deposits from $25","Cancel anytime"]'::jsonb, 0::boolean, 1::boolean, 1, now(), now()),
('7b3f1c2e-0000-4a00-8000-000000000002', 'Growth', 'Stocks-focused portfolio for long-term growth.', 5000, 50000, '12 months recommended', 'Monthly', 'moderate', '6–9% a year', '0.40% a year', '["80% equities, 20% bonds","Quarterly performance reports","Tax-efficient rebalancing","Priority support"]'::jsonb, 1::boolean, 1::boolean, 2, now(), now()),
('7b3f1c2e-0000-4a00-8000-000000000003', 'Tesla & EV Focus', 'Concentrated exposure to Tesla and the EV supply chain.', 1000, 100000, '3+ years recommended', 'Anytime', 'high', 'Varies widely (volatile)', '0.50% a year', '["Tesla plus EV, battery and charging stocks","Fractional shares from $1","Key-date alerts for deliveries and earnings","Single-sector risk: expect large swings"]'::jsonb, 0::boolean, 1::boolean, 3, now(), now()),
('7b3f1c2e-0000-4a00-8000-000000000004', 'Premium', 'Managed portfolio with a dedicated account manager.', 50000, NULL, '12 months minimum', 'On request (5 business days)', 'moderate', '5–8% a year', '0.75% a year', '["Custom allocation across stocks, bonds and crypto","Dedicated account manager","Consolidated reporting","Personal onboarding"]'::jsonb, 0::boolean, 1::boolean, 4, now(), now());
--> statement-breakpoint
INSERT INTO "payment_methods" ("id", "name", "network", "address", "updated_at") VALUES
('acd20830-5f94-4565-81b0-2f6946a3c001', 'Bitcoin', 'Bitcoin', '', now()),
('acd20830-5f94-4565-81b0-2f6946a3c002', 'Ethereum', 'Ethereum (ERC-20)', '', now()),
('acd20830-5f94-4565-81b0-2f6946a3c003', 'USDT', 'Tron (TRC-20)', '', now()),
('acd20830-5f94-4565-81b0-2f6946a3c004', 'USDT', 'Ethereum (ERC-20)', '', now());
