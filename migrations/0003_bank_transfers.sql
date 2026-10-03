ALTER TABLE "payment_methods" ADD COLUMN "kind" text DEFAULT 'wallet' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "account_name" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "routing_number" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "instructions" text;