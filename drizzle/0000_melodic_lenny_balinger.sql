CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`title` text NOT NULL,
	`issuing_organization` text NOT NULL,
	`certificate_type` text DEFAULT 'Certificate' NOT NULL,
	`issue_date` text NOT NULL,
	`expiration_date` text,
	`credential_id` text,
	`verification_url` text,
	`verification_status` text DEFAULT 'link_available' NOT NULL,
	`category` text DEFAULT 'Professional' NOT NULL,
	`collection` text,
	`skills` text DEFAULT '[]' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`private_notes` text DEFAULT '' NOT NULL,
	`file_key` text,
	`file_name` text,
	`file_type` text DEFAULT 'image' NOT NULL,
	`orientation` text DEFAULT 'landscape' NOT NULL,
	`rotation` integer DEFAULT 0 NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`allow_download` integer DEFAULT true NOT NULL,
	`show_credential_id` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_draft` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`certificate_id` text NOT NULL,
	`reminder_date` text NOT NULL,
	`reminder_type` text DEFAULT '30_days' NOT NULL,
	`is_sent` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`username` text NOT NULL,
	`headline` text DEFAULT '' NOT NULL,
	`biography` text DEFAULT '' NOT NULL,
	`gallery_visibility` text DEFAULT 'public' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);