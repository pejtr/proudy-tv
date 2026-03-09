CREATE TABLE `stream_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stream_id` int NOT NULL,
	`streamer_id` int NOT NULL,
	`viewer_count` int NOT NULL DEFAULT 0,
	`chat_messages_per_min` int NOT NULL DEFAULT 0,
	`new_followers` int NOT NULL DEFAULT 0,
	`new_subscribers` int NOT NULL DEFAULT 0,
	`donation_amount` int NOT NULL DEFAULT 0,
	`snapshot_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stream_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `stream_idx` ON `stream_analytics` (`stream_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `stream_analytics` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `snapshot_at_idx` ON `stream_analytics` (`snapshot_at`);