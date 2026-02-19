CREATE TABLE `goal_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goal_id` int NOT NULL,
	`milestone_value` int NOT NULL,
	`reached_at` timestamp NOT NULL DEFAULT (now()),
	`celebration_shown` boolean NOT NULL DEFAULT false,
	CONSTRAINT `goal_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stream_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`type` enum('sub_goal','donation_goal') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`target_value` int NOT NULL,
	`current_value` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`widget_color` varchar(7) DEFAULT '#8b5cf6',
	`widget_position` enum('top_left','top_right','bottom_left','bottom_right') DEFAULT 'top_right',
	`show_on_stream` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stream_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `goal_idx` ON `goal_milestones` (`goal_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `stream_goals` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `stream_goals` (`is_active`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `stream_goals` (`type`);