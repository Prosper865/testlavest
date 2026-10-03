CREATE TABLE "vehicle_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vehicle_id" text,
	"vehicle_name" text NOT NULL,
	"price" integer NOT NULL,
	"method_name" text NOT NULL,
	"network" text NOT NULL,
	"address" text NOT NULL,
	"screenshot_key" text NOT NULL,
	"screenshot_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"review_note" text
);
--> statement-breakpoint
ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vehicle_orders_user_idx" ON "vehicle_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vehicle_orders_status_idx" ON "vehicle_orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_orders_pending_idx" ON "vehicle_orders" USING btree ("user_id","vehicle_id") WHERE "vehicle_orders"."status" = 'pending';