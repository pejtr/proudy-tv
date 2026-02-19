CREATE TABLE `community_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`like_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`creator_id` int NOT NULL,
	`icon_url` text,
	`banner_url` text,
	`member_count` int NOT NULL DEFAULT 0,
	`post_count` int NOT NULL DEFAULT 0,
	`is_public` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`group_id` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('discussion','help','showcase','memes','announcement') NOT NULL DEFAULT 'discussion',
	`is_pinned` boolean NOT NULL DEFAULT false,
	`like_count` int NOT NULL DEFAULT 0,
	`comment_count` int NOT NULL DEFAULT 0,
	`view_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('member','moderator','admin') NOT NULL DEFAULT 'member',
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `post_idx` ON `community_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `community_comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `community_groups` (`creator_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `community_posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `group_idx` ON `community_posts` (`group_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `community_posts` (`category`);--> statement-breakpoint
CREATE INDEX `group_idx` ON `group_members` (`group_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `unique_membership` ON `group_members` (`group_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `post_likes` (`post_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `post_likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `unique_like` ON `post_likes` (`post_id`,`user_id`);