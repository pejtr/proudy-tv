CREATE TABLE `feed_interactions` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`feed_item_id` int NOT NULL,
	`user_id` int NOT NULL,
	`interaction_type` enum('view','like','share','not_interested') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feed_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stream_id` int,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`media_url` text NOT NULL,
	`thumbnail_url` text,
	`duration` int NOT NULL,
	`view_count` int NOT NULL DEFAULT 0,
	`like_count` int NOT NULL DEFAULT 0,
	`comment_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feed_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`follower_id` int NOT NULL,
	`following_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`sender_id` int NOT NULL,
	`receiver_id` int NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`media_url` text NOT NULL,
	`media_type` enum('image','video') NOT NULL,
	`duration` int NOT NULL DEFAULT 15,
	`view_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `story_views` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`story_id` int NOT NULL,
	`viewer_id` int NOT NULL,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `story_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `social_links` text;--> statement-breakpoint
CREATE INDEX `feed_item_idx` ON `feed_interactions` (`feed_item_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `feed_interactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `feed_interactions` (`interaction_type`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `feed_items` (`user_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `feed_items` (`stream_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `feed_items` (`created_at`);--> statement-breakpoint
CREATE INDEX `follower_idx` ON `follows` (`follower_id`);--> statement-breakpoint
CREATE INDEX `following_idx` ON `follows` (`following_id`);--> statement-breakpoint
CREATE INDEX `unique_follow` ON `follows` (`follower_id`,`following_id`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `receiver_idx` ON `messages` (`receiver_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `stories` (`user_id`);--> statement-breakpoint
CREATE INDEX `expires_at_idx` ON `stories` (`expires_at`);--> statement-breakpoint
CREATE INDEX `story_idx` ON `story_views` (`story_id`);--> statement-breakpoint
CREATE INDEX `viewer_idx` ON `story_views` (`viewer_id`);--> statement-breakpoint
CREATE INDEX `unique_view` ON `story_views` (`story_id`,`viewer_id`);