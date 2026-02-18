CREATE TABLE `chat_messages` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`stream_id` int NOT NULL,
	`user_id` int NOT NULL,
	`username` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_moderated` boolean NOT NULL DEFAULT false,
	`moderation_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('stream_started','high_viewers','technical_issue') NOT NULL,
	`stream_id` int,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stream_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`ar_filter_enabled` boolean NOT NULL DEFAULT false,
	`ar_filter_type` varchar(64),
	`voice_changer_enabled` boolean NOT NULL DEFAULT false,
	`voice_changer_preset` varchar(64),
	`avatar_enabled` boolean NOT NULL DEFAULT false,
	`avatar_model_url` text,
	`avatar_config` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stream_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `stream_settings_streamer_id_unique` UNIQUE(`streamer_id`)
);
--> statement-breakpoint
CREATE TABLE `streams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`stream_key` varchar(64) NOT NULL,
	`is_live` boolean NOT NULL DEFAULT false,
	`started_at` timestamp,
	`ended_at` timestamp,
	`viewer_count` int NOT NULL DEFAULT 0,
	`peak_viewer_count` int NOT NULL DEFAULT 0,
	`thumbnail_url` text,
	`vod_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streams_id` PRIMARY KEY(`id`),
	CONSTRAINT `streams_stream_key_unique` UNIQUE(`stream_key`)
);
--> statement-breakpoint
CREATE TABLE `viewer_sessions` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`stream_id` int NOT NULL,
	`user_id` int,
	`session_id` varchar(64) NOT NULL,
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	`left_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `viewer_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('viewer','streamer','admin') NOT NULL DEFAULT 'viewer';--> statement-breakpoint
CREATE INDEX `stream_idx` ON `chat_messages` (`stream_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `chat_messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `chat_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `is_read_idx` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `stream_settings` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `streams` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `is_live_idx` ON `streams` (`is_live`);--> statement-breakpoint
CREATE INDEX `started_at_idx` ON `streams` (`started_at`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `viewer_sessions` (`stream_id`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `viewer_sessions` (`session_id`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `viewer_sessions` (`is_active`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);