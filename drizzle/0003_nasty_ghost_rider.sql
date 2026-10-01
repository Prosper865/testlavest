CREATE TABLE `plan_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text,
	`plan_name` text NOT NULL,
	`amount` integer NOT NULL,
	`method_name` text NOT NULL,
	`network` text NOT NULL,
	`address` text NOT NULL,
	`screenshot` blob NOT NULL,
	`screenshot_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`submitted_at` integer NOT NULL,
	`reviewed_at` integer,
	`reviewed_by` text,
	`review_note` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `investment_plans`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `plan_payments_user_idx` ON `plan_payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `plan_payments_status_idx` ON `plan_payments` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `plan_payments_pending_idx` ON `plan_payments` (`user_id`,`plan_id`) WHERE "plan_payments"."status" = 'pending';