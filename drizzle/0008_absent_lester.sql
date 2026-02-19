CREATE TABLE `chat_polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stream_id` int NOT NULL,
	`creator_id` int NOT NULL,
	`question` varchar(255) NOT NULL,
	`options` text NOT NULL,
	`duration_minutes` int NOT NULL DEFAULT 5,
	`is_active` boolean NOT NULL DEFAULT true,
	`total_votes` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `chat_polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_emotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`image_url` text NOT NULL,
	`tier` enum('free','subscriber') NOT NULL DEFAULT 'free',
	`usage_count` int NOT NULL DEFAULT 0,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`generated_by_ai` boolean NOT NULL DEFAULT false,
	`ai_prompt` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_emotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `poll_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poll_id` int NOT NULL,
	`user_id` int NOT NULL,
	`option_index` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poll_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `stream_idx` ON `chat_polls` (`stream_id`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `chat_polls` (`creator_id`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `chat_polls` (`is_active`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `custom_emotes` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `unique_name` ON `custom_emotes` (`streamer_id`,`name`);--> statement-breakpoint
CREATE INDEX `poll_idx` ON `poll_votes` (`poll_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `poll_votes` (`user_id`);--> statement-breakpoint
CREATE INDEX `unique_vote` ON `poll_votes` (`poll_id`,`user_id`);