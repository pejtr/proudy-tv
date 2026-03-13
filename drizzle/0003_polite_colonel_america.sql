CREATE TABLE `emote_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`emote_id` int NOT NULL,
	`listing_id` int NOT NULL,
	`price_paid` int NOT NULL,
	`purchased_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emote_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emote_store_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emote_id` int NOT NULL,
	`streamer_id` int NOT NULL,
	`price_coins` int NOT NULL DEFAULT 50,
	`is_public` boolean NOT NULL DEFAULT true,
	`total_sold` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emote_store_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`streamer_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `split_chat_messages` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`stream_id` int NOT NULL,
	`platform` enum('proudy','twitch','youtube','kick','facebook') NOT NULL DEFAULT 'proudy',
	`external_user_id` varchar(255),
	`username` varchar(255) NOT NULL,
	`display_name` varchar(255),
	`message` text NOT NULL,
	`user_color` varchar(7),
	`badges` text,
	`is_subscriber` boolean NOT NULL DEFAULT false,
	`is_moderator` boolean NOT NULL DEFAULT false,
	`is_vip` boolean NOT NULL DEFAULT false,
	`is_deleted` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `split_chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `emote_purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `emote_idx` ON `emote_purchases` (`emote_id`);--> statement-breakpoint
CREATE INDEX `emote_idx` ON `emote_store_listings` (`emote_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `emote_store_listings` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `push_subscriptions` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `split_chat_messages` (`stream_id`);--> statement-breakpoint
CREATE INDEX `platform_idx` ON `split_chat_messages` (`platform`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `split_chat_messages` (`created_at`);