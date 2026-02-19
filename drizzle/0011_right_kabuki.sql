ALTER TABLE `users` ADD `verification_token` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `verification_token_expiry` timestamp;