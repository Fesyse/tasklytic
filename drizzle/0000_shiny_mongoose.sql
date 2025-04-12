CREATE TABLE `froo_post` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` text,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `froo_post_id` PRIMARY KEY(`id`),
	CONSTRAINT `froo_post_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `froo_post` (`name`);