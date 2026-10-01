ALTER TABLE "plan_payments" ADD COLUMN "screenshot_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_payments" DROP COLUMN "screenshot";
