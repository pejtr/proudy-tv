CREATE TABLE `multistream_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`platform` enum('twitch','kick','youtube','facebook') NOT NULL,
	`platform_username` varchar(255),
	`stream_key` text,
	`ingest_url` text,
	`enabled` boolean NOT NULL DEFAULT true,
	`is_twitch_partner` boolean NOT NULL DEFAULT false,
	`last_streamed_at` timestamp,
	`total_stream_hours` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `multistream_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `multistream_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`mode` enum('affiliate','partner','exclusive') NOT NULL DEFAULT 'affiliate',
	`auto_enable_new_platforms` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `multistream_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `multistream_settings_streamer_id_unique` UNIQUE(`streamer_id`)
);
--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `multistream_connections` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `platform_idx` ON `multistream_connections` (`platform`);--> statement-breakpoint
CREATE INDEX `unique_connection` ON `multistream_connections` (`streamer_id`,`platform`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `multistream_settings` (`streamer_id`);