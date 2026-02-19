CREATE TABLE `custom_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` text,
	`cost` int NOT NULL,
	`icon_url` text,
	`background_color` varchar(7) DEFAULT '#9146FF',
	`is_enabled` boolean NOT NULL DEFAULT true,
	`requires_input` boolean NOT NULL DEFAULT false,
	`cooldown_minutes` int NOT NULL DEFAULT 0,
	`max_redemptions_per_stream` int,
	`max_redemptions_per_user` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reward_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reward_id` int NOT NULL,
	`user_id` int NOT NULL,
	`streamer_id` int NOT NULL,
	`stream_id` int,
	`user_input` text,
	`status` enum('pending','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`fulfilled_at` timestamp,
	CONSTRAINT `reward_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watch_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`streamer_id` int NOT NULL,
	`stream_id` int,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`ended_at` timestamp,
	`duration_minutes` int NOT NULL DEFAULT 0,
	`points_earned` int NOT NULL DEFAULT 0,
	`had_subscription` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watch_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watch_streaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`streamer_id` int NOT NULL,
	`current_streak` int NOT NULL DEFAULT 0,
	`longest_streak` int NOT NULL DEFAULT 0,
	`last_watch_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watch_streaks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `watch_points` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `custom_rewards` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `reward_idx` ON `reward_redemptions` (`reward_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `reward_redemptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `reward_redemptions` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `reward_redemptions` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `watch_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `watch_sessions` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `watch_sessions` (`stream_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `watch_streaks` (`user_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `watch_streaks` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `unique_streak` ON `watch_streaks` (`user_id`,`streamer_id`);