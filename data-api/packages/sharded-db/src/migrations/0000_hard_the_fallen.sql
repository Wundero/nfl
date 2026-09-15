CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`season` integer NOT NULL,
	`week` integer NOT NULL,
	`home_team_id` text,
	`away_team_id` text,
	`kickoff` integer,
	`home_score` integer,
	`away_score` integer,
	`status` text NOT NULL,
	`vegas_spread` real,
	`vegas_total` real,
	FOREIGN KEY (`home_team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`away_team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `game_week_idx` ON `game` (`season`,`week`);--> statement-breakpoint
CREATE INDEX `game_away_idx` ON `game` (`away_team_id`);--> statement-breakpoint
CREATE INDEX `game_home_idx` ON `game` (`home_team_id`);--> statement-breakpoint
CREATE INDEX `game_teams_idx` ON `game` (`home_team_id`,`away_team_id`);--> statement-breakpoint
CREATE TABLE `injury_report` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text NOT NULL,
	`season` integer NOT NULL,
	`week` integer NOT NULL,
	`status` text NOT NULL,
	`practice_participation` text,
	`reported_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `injury_player_idx` ON `injury_report` (`player_id`);--> statement-breakpoint
CREATE INDEX `injury_team_idx` ON `injury_report` (`team_id`);--> statement-breakpoint
CREATE TABLE `odds_line` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`player_id` text,
	`team_id` text,
	`market_type` text NOT NULL,
	`line` real,
	`odds` integer,
	`captured_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `odds_game_market_idx` ON `odds_line` (`game_id`,`market_type`,`captured_at`);--> statement-breakpoint
CREATE INDEX `odds_player_idx` ON `odds_line` (`player_id`);--> statement-breakpoint
CREATE INDEX `odds_game_idx` ON `odds_line` (`game_id`);--> statement-breakpoint
CREATE TABLE `player_game_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`game_id` text NOT NULL,
	`team_id` text NOT NULL,
	`season` integer NOT NULL,
	`week` integer NOT NULL,
	`snap_pct` real,
	`targets` integer,
	`carries` integer,
	`fantasy_pts_std` real,
	`fantasy_pts_ppr` real,
	`raw_stats` text,
	`source` text NOT NULL,
	`version_hash` text NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pgs_player_week_idx` ON `player_game_stats` (`player_id`,`game_id`);--> statement-breakpoint
CREATE INDEX `pgs_hash_idx` ON `player_game_stats` (`version_hash`);--> statement-breakpoint
CREATE INDEX `pgs_player_idx` ON `player_game_stats` (`player_id`);--> statement-breakpoint
CREATE INDEX `pgs_game_idx` ON `player_game_stats` (`game_id`);--> statement-breakpoint
CREATE INDEX `pgs_team_idx` ON `player_game_stats` (`team_id`);--> statement-breakpoint
CREATE TABLE `player` (
	`id` text PRIMARY KEY NOT NULL,
	`gsis_id` text,
	`espn_id` text,
	`sleeper_id` text,
	`name` text NOT NULL,
	`position` text NOT NULL,
	`team_id` text,
	`draft_year` integer,
	`draft_capital` text,
	`college` text,
	`source` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `player_position_idx` ON `player` (`position`);--> statement-breakpoint
CREATE INDEX `player_team_idx` ON `player` (`team_id`);--> statement-breakpoint
CREATE TABLE `sync_state` (
	`resource_key` text PRIMARY KEY NOT NULL,
	`version_hash` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sync_version_idx` ON `sync_state` (`version_hash`);--> statement-breakpoint
CREATE TABLE `team` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`conference` text NOT NULL,
	`division` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `team_name_idx` ON `team` (`name`);