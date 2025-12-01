CREATE TABLE `cauldron_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text,
	`content` text NOT NULL,
	`order` integer NOT NULL,
	`added_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `cauldron_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cauldron_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ingredient_ids` text DEFAULT '[]' NOT NULL,
	`output_idea_id` text,
	`output_text` text,
	`patterns` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oracle_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`sparked_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `oracle_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oracle_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`idea_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `saved_ideas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `saved_ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`source` text NOT NULL,
	`tags` text DEFAULT '[]',
	`is_cauldron_output` integer DEFAULT 0 NOT NULL,
	`cauldron_session_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `spark_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text NOT NULL,
	`core_ideas` text NOT NULL,
	`lenses` text NOT NULL,
	`nudges` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tarot_readings` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`date` text NOT NULL,
	`card_options` text NOT NULL,
	`chosen_card` text,
	`interpretation` text,
	`spark_prompt` text,
	`used_as_input` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
