CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"model" text NOT NULL,
	"trim" text NOT NULL,
	"year" integer NOT NULL,
	"condition" text NOT NULL,
	"price" integer NOT NULL,
	"range_miles" integer NOT NULL,
	"zero_to_sixty" real NOT NULL,
	"mileage" integer,
	"color" text NOT NULL,
	"swatch" text NOT NULL,
	"highlight" text NOT NULL,
	"image_url" text,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "vehicles_order_idx" ON "vehicles" USING btree ("sort_order");--> statement-breakpoint
INSERT INTO "vehicles" ("id", "model", "trim", "year", "condition", "price", "range_miles", "zero_to_sixty", "mileage", "color", "swatch", "highlight", "sort_order", "created_at", "updated_at") VALUES
  ('model-3-lr', 'Model 3', 'Long Range AWD', 2025, 'New', 47490, 346, 4.2, NULL, 'Pearl White', '#e9e6e2', 'Efficient everyday sedan', 1, now(), now()),
  ('model-y-lr', 'Model Y', 'Long Range AWD', 2025, 'New', 49990, 327, 4.6, NULL, 'Ultra Red', '#b3141f', 'Versatile midsize SUV', 2, now(), now()),
  ('model-s', 'Model S', 'Dual Motor AWD', 2025, 'New', 79990, 405, 3.1, NULL, 'Stealth Grey', '#5a5d62', 'Long-range flagship sedan', 3, now(), now()),
  ('model-x', 'Model X', 'Dual Motor AWD', 2025, 'New', 84990, 352, 3.8, NULL, 'Deep Blue', '#1f3558', 'Seven-seat family SUV', 4, now(), now()),
  ('cybertruck', 'Cybertruck', 'All-Wheel Drive', 2025, 'New', 79990, 325, 4.1, NULL, 'Stainless Steel', '#a9adb1', 'Stainless-steel pickup', 5, now(), now()),
  ('model-3-2022', 'Model 3', 'Rear-Wheel Drive', 2022, 'Pre-owned', 26900, 272, 5.8, 28400, 'Midnight Silver', '#4b4f55', 'Inspected, single owner', 6, now(), now()),
  ('model-y-2021', 'Model Y', 'Long Range AWD', 2021, 'Pre-owned', 31500, 318, 4.8, 41200, 'Solid Black', '#1d1d1f', 'Inspected, tow package', 7, now(), now()),
  ('model-s-2020', 'Model S', 'Long Range Plus', 2020, 'Pre-owned', 42800, 402, 3.7, 52600, 'Pearl White', '#e9e6e2', 'Inspected, premium interior', 8, now(), now());
