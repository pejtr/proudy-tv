ALTER TABLE `users` ADD `email_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `partner_tier` enum('basic','affiliate','partner') DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `monthly_stream_hours` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `active_subscribers` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_tier_check` timestamp DEFAULT (now()) NOT NULL;