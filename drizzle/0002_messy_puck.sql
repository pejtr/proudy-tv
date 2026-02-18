ALTER TABLE `stream_settings` ADD `background_type` enum('none','image','video','greenscreen') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `stream_settings` ADD `background_url` text;--> statement-breakpoint
ALTER TABLE `stream_settings` ADD `pip_layout` enum('rectangular','circular') DEFAULT 'rectangular';--> statement-breakpoint
ALTER TABLE `stream_settings` ADD `pip_position` enum('top-left','top-right','bottom-left','bottom-right','center') DEFAULT 'bottom-right';--> statement-breakpoint
ALTER TABLE `stream_settings` ADD `pip_size` enum('small','medium','large') DEFAULT 'medium';