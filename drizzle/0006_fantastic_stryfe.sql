CREATE TABLE `coin_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('purchase','donation','subscription','refund') NOT NULL,
	`description` text,
	`stripe_payment_intent_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coin_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donation_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`amount` int NOT NULL,
	`slot_number` int NOT NULL,
	`video_url` text,
	`audio_url` text,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donation_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`donor_id` int NOT NULL,
	`streamer_id` int NOT NULL,
	`stream_id` int,
	`amount` int NOT NULL,
	`message` text,
	`tier_slot` int,
	`is_anonymous` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriber_id` int NOT NULL,
	`streamer_id` int NOT NULL,
	`stripe_subscription_id` varchar(255),
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`cancelled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `coins_balance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_customer_id` varchar(255);--> statement-breakpoint
CREATE INDEX `user_idx` ON `coin_transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `coin_transactions` (`type`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `donation_tiers` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `unique_slot` ON `donation_tiers` (`streamer_id`,`slot_number`);--> statement-breakpoint
CREATE INDEX `donor_idx` ON `donations` (`donor_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `donations` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `donations` (`stream_id`);--> statement-breakpoint
CREATE INDEX `subscriber_idx` ON `subscriptions` (`subscriber_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `subscriptions` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscriptions` (`status`);