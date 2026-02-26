CREATE TABLE `alert_customizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamer_id` int NOT NULL,
	`follow_enabled` boolean NOT NULL DEFAULT true,
	`follow_sound_url` text,
	`follow_animation` enum('bounce','slide','fade','confetti','fireworks') DEFAULT 'bounce',
	`follow_text_template` text,
	`follow_duration` int NOT NULL DEFAULT 5,
	`sub_enabled` boolean NOT NULL DEFAULT true,
	`sub_sound_url` text,
	`sub_animation` enum('bounce','slide','fade','confetti','fireworks') DEFAULT 'confetti',
	`sub_text_template` text,
	`sub_duration` int NOT NULL DEFAULT 7,
	`donation_enabled` boolean NOT NULL DEFAULT true,
	`donation_sound_url` text,
	`donation_animation` enum('bounce','slide','fade','confetti','fireworks') DEFAULT 'fireworks',
	`donation_text_template` text,
	`donation_duration` int NOT NULL DEFAULT 10,
	`raid_enabled` boolean NOT NULL DEFAULT true,
	`raid_sound_url` text,
	`raid_animation` enum('bounce','slide','fade','confetti','fireworks') DEFAULT 'slide',
	`raid_text_template` text,
	`raid_duration` int NOT NULL DEFAULT 10,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_customizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `alert_customizations_streamer_id_unique` UNIQUE(`streamer_id`)
);
--> statement-breakpoint
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
CREATE TABLE `clip_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clip_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clip_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clip_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clip_id` int NOT NULL,
	`user_id` int,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clip_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stream_id` int NOT NULL,
	`creator_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`start_time` int NOT NULL,
	`end_time` int NOT NULL,
	`duration` int NOT NULL,
	`video_url` text NOT NULL,
	`thumbnail_url` text,
	`view_count` int NOT NULL DEFAULT 0,
	`like_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `goal_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goal_id` int NOT NULL,
	`milestone_value` int NOT NULL,
	`reached_at` timestamp NOT NULL DEFAULT (now()),
	`celebration_shown` boolean NOT NULL DEFAULT false,
	CONSTRAINT `goal_milestones_id` PRIMARY KEY(`id`)
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
CREATE TABLE `poll_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poll_id` int NOT NULL,
	`user_id` int NOT NULL,
	`option_index` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poll_votes_id` PRIMARY KEY(`id`)
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
	`background_type` enum('none','image','video','greenscreen') DEFAULT 'none',
	`background_url` text,
	`pip_layout` enum('rectangular','circular') DEFAULT 'rectangular',
	`pip_position` enum('top-left','top-right','bottom-left','bottom-right','center') DEFAULT 'bottom-right',
	`pip_size` enum('small','medium','large') DEFAULT 'medium',
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
	`hls_url` text,
	`vod_url` text,
	`category` enum('Chill & Talk','Gaming','Music','ASMR') NOT NULL DEFAULT 'Chill & Talk',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streams_id` PRIMARY KEY(`id`),
	CONSTRAINT `streams_stream_key_unique` UNIQUE(`stream_key`)
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('viewer','streamer','admin') NOT NULL DEFAULT 'viewer',
	`email_verified` boolean NOT NULL DEFAULT false,
	`verification_token` varchar(64),
	`verification_token_expiry` timestamp,
	`avatar_url` text,
	`bio` text,
	`social_links` text,
	`partner_tier` enum('basic','affiliate','partner') NOT NULL DEFAULT 'basic',
	`monthly_stream_hours` int NOT NULL DEFAULT 0,
	`active_subscribers` int NOT NULL DEFAULT 0,
	`last_tier_check` timestamp NOT NULL DEFAULT (now()),
	`coins_balance` int NOT NULL DEFAULT 0,
	`watch_points` int NOT NULL DEFAULT 0,
	`stripe_customer_id` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
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
CREATE INDEX `streamer_idx` ON `alert_customizations` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `chat_messages` (`stream_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `chat_messages` (`user_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `chat_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `chat_polls` (`stream_id`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `chat_polls` (`creator_id`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `chat_polls` (`is_active`);--> statement-breakpoint
CREATE INDEX `clip_idx` ON `clip_likes` (`clip_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `clip_likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `unique_like` ON `clip_likes` (`clip_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `clip_idx` ON `clip_views` (`clip_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `clip_views` (`user_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `clips` (`stream_id`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `clips` (`creator_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `clips` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `coin_transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `coin_transactions` (`type`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `community_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `community_comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `community_groups` (`creator_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `community_posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `group_idx` ON `community_posts` (`group_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `community_posts` (`category`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `custom_emotes` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `unique_name` ON `custom_emotes` (`streamer_id`,`name`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `custom_rewards` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `donation_tiers` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `unique_slot` ON `donation_tiers` (`streamer_id`,`slot_number`);--> statement-breakpoint
CREATE INDEX `donor_idx` ON `donations` (`donor_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `donations` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `donations` (`stream_id`);--> statement-breakpoint
CREATE INDEX `feed_item_idx` ON `feed_interactions` (`feed_item_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `feed_interactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `feed_interactions` (`interaction_type`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `feed_items` (`user_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `feed_items` (`stream_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `feed_items` (`created_at`);--> statement-breakpoint
CREATE INDEX `follower_idx` ON `follows` (`follower_id`);--> statement-breakpoint
CREATE INDEX `following_idx` ON `follows` (`following_id`);--> statement-breakpoint
CREATE INDEX `unique_follow` ON `follows` (`follower_id`,`following_id`);--> statement-breakpoint
CREATE INDEX `goal_idx` ON `goal_milestones` (`goal_id`);--> statement-breakpoint
CREATE INDEX `group_idx` ON `group_members` (`group_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `unique_membership` ON `group_members` (`group_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `receiver_idx` ON `messages` (`receiver_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `is_read_idx` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `poll_idx` ON `poll_votes` (`poll_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `poll_votes` (`user_id`);--> statement-breakpoint
CREATE INDEX `unique_vote` ON `poll_votes` (`poll_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `post_likes` (`post_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `post_likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `unique_like` ON `post_likes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `reward_idx` ON `reward_redemptions` (`reward_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `reward_redemptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `reward_redemptions` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `reward_redemptions` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `stories` (`user_id`);--> statement-breakpoint
CREATE INDEX `expires_at_idx` ON `stories` (`expires_at`);--> statement-breakpoint
CREATE INDEX `story_idx` ON `story_views` (`story_id`);--> statement-breakpoint
CREATE INDEX `viewer_idx` ON `story_views` (`viewer_id`);--> statement-breakpoint
CREATE INDEX `unique_view` ON `story_views` (`story_id`,`viewer_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `stream_goals` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `stream_goals` (`is_active`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `stream_goals` (`type`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `stream_settings` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `streams` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `is_live_idx` ON `streams` (`is_live`);--> statement-breakpoint
CREATE INDEX `started_at_idx` ON `streams` (`started_at`);--> statement-breakpoint
CREATE INDEX `subscriber_idx` ON `subscriptions` (`subscriber_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `subscriptions` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `viewer_sessions` (`stream_id`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `viewer_sessions` (`session_id`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `viewer_sessions` (`is_active`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `watch_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `watch_sessions` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `stream_idx` ON `watch_sessions` (`stream_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `watch_streaks` (`user_id`);--> statement-breakpoint
CREATE INDEX `streamer_idx` ON `watch_streaks` (`streamer_id`);--> statement-breakpoint
CREATE INDEX `unique_streak` ON `watch_streaks` (`user_id`,`streamer_id`);