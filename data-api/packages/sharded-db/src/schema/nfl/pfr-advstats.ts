import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { game } from "./games";
import { player, season, team } from "./reference";

const meta = () => ({
  contentHash: text("content_hash"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const pfrAdvDefSeason = sqliteTable(
  "pfr_adv_def_season",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    gamesPlayed: integer("games_played"),
    gamesStarted: integer("games_started"),
    interceptions: real("interceptions"),
    targets: real("targets"),
    completionsAllowed: real("completions_allowed"),
    completionPercentageAllowed: real("completion_percentage_allowed"),
    yardsAllowed: real("yards_allowed"),
    yardsPerCompletionAllowed: real("yards_per_completion_allowed"),
    yardsPerTargetAllowed: real("yards_per_target_allowed"),
    touchdownsAllowed: real("touchdowns_allowed"),
    passerRatingAllowed: real("passer_rating_allowed"),
    averageDepthOfTargetAllowed: real("average_depth_of_target_allowed"),
    completedAirYards: real("completed_air_yards"),
    yardsAfterCatchAllowed: real("yards_after_catch_allowed"),
    timesBlitzed: real("times_blitzed"),
    hurries: real("hurries"),
    quarterbackKnockdowns: real("quarterback_knockdowns"),
    sacks: real("sacks"),
    pressures: real("pressures"),
    combinedTackles: real("combined_tackles"),
    missedTackles: real("missed_tackles"),
    missedTacklePercentage: real("missed_tackle_percentage"),
    passesBattedDown: real("passes_batted_down"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_def_season_unique_idx").on(t.playerId, t.seasonId)],
);

export const pfrAdvPassSeason = sqliteTable(
  "pfr_adv_pass_season",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    passAttempts: real("pass_attempts"),
    throwaways: real("throwaways"),
    spikes: real("spikes"),
    drops: real("drops"),
    dropPercentage: real("drop_percentage"),
    badThrows: real("bad_throws"),
    badThrowPercentage: real("bad_throw_percentage"),
    averageTimeToThrow: real("average_time_to_throw"),
    timesBlitzed: real("times_blitzed"),
    timesHurried: real("times_hurried"),
    timesHit: real("times_hit"),
    timesPressured: real("times_pressured"),
    pressurePercentage: real("pressure_percentage"),
    battedBalls: real("batted_balls"),
    onTargetThrows: real("on_target_throws"),
    onTargetPercentage: real("on_target_percentage"),
    runPassOptionPlays: real("run_pass_option_plays"),
    runPassOptionYards: real("run_pass_option_yards"),
    runPassOptionPassAttempts: real("run_pass_option_pass_attempts"),
    runPassOptionPassYards: real("run_pass_option_pass_yards"),
    runPassOptionRushAttempts: real("run_pass_option_rush_attempts"),
    runPassOptionRushYards: real("run_pass_option_rush_yards"),
    playActionPassAttempts: real("play_action_pass_attempts"),
    playActionPassYards: real("play_action_pass_yards"),
    intendedAirYards: real("intended_air_yards"),
    intendedAirYardsPerPassAttempt: real("intended_air_yards_per_pass_attempt"),
    completedAirYards: real("completed_air_yards"),
    completedAirYardsPerCompletion: real("completed_air_yards_per_completion"),
    completedAirYardsPerPassAttempt: real("completed_air_yards_per_pass_attempt"),
    passingYardsAfterCatch: real("passing_yards_after_catch"),
    passingYardsAfterCatchPerCompletion: real("passing_yards_after_catch_per_completion"),
    scrambles: real("scrambles"),
    scrambleYardsPerAttempt: real("scramble_yards_per_attempt"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_pass_season_unique_idx").on(t.playerId, t.seasonId)],
);

export const pfrAdvRushSeason = sqliteTable(
  "pfr_adv_rush_season",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    gamesPlayed: integer("games_played"),
    gamesStarted: integer("games_started"),
    rushingAttempts: real("rushing_attempts"),
    rushingYards: real("rushing_yards"),
    rushingTouchdowns: real("rushing_touchdowns"),
    rushingFirstDowns: real("rushing_first_downs"),
    yardsBeforeContact: real("yards_before_contact"),
    yardsBeforeContactPerAttempt: real("yards_before_contact_per_attempt"),
    yardsAfterContact: real("yards_after_contact"),
    yardsAfterContactPerAttempt: real("yards_after_contact_per_attempt"),
    brokenTackles: real("broken_tackles"),
    attemptsPerBrokenTackle: real("attempts_per_broken_tackle"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_rush_season_unique_idx").on(t.playerId, t.seasonId)],
);

export const pfrAdvRecSeason = sqliteTable(
  "pfr_adv_rec_season",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    gamesPlayed: integer("games_played"),
    gamesStarted: integer("games_started"),
    targets: real("targets"),
    receptions: real("receptions"),
    receivingYards: real("receiving_yards"),
    receivingTouchdowns: real("receiving_touchdowns"),
    receivingFirstDowns: real("receiving_first_downs"),
    yardsBeforeCatch: real("yards_before_catch"),
    yardsBeforeCatchPerReception: real("yards_before_catch_per_reception"),
    yardsAfterCatch: real("yards_after_catch"),
    yardsAfterCatchPerReception: real("yards_after_catch_per_reception"),
    averageDepthOfTarget: real("average_depth_of_target"),
    brokenTackles: real("broken_tackles"),
    receptionsPerBrokenTackle: real("receptions_per_broken_tackle"),
    drops: real("drops"),
    dropPercentage: real("drop_percentage"),
    interceptions: real("interceptions"),
    passerRating: real("passer_rating"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_rec_season_unique_idx").on(t.playerId, t.seasonId)],
);

export const pfrAdvDefWeek = sqliteTable(
  "pfr_adv_def_week",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    interceptions: real("interceptions"),
    targets: real("targets"),
    completionsAllowed: real("completions_allowed"),
    completionPercentageAllowed: real("completion_percentage_allowed"),
    yardsAllowed: real("yards_allowed"),
    yardsPerCompletionAllowed: real("yards_per_completion_allowed"),
    yardsPerTargetAllowed: real("yards_per_target_allowed"),
    touchdownsAllowed: real("touchdowns_allowed"),
    passerRatingAllowed: real("passer_rating_allowed"),
    averageDepthOfTargetAllowed: real("average_depth_of_target_allowed"),
    completedAirYards: real("completed_air_yards"),
    yardsAfterCatchAllowed: real("yards_after_catch_allowed"),
    timesBlitzed: real("times_blitzed"),
    timesHurried: real("times_hurried"),
    timesHitQuarterback: real("times_hit_quarterback"),
    sacks: real("sacks"),
    pressures: real("pressures"),
    combinedTackles: real("combined_tackles"),
    missedTackles: real("missed_tackles"),
    missedTacklePercentage: real("missed_tackle_percentage"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_def_week_unique_idx").on(t.playerId, t.gameId)],
);

export const pfrAdvPassWeek = sqliteTable(
  "pfr_adv_pass_week",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    passingDrops: real("passing_drops"),
    passingDropPercentage: real("passing_drop_percentage"),
    receivingDrops: real("receiving_drops"),
    receivingDropPercentage: real("receiving_drop_percentage"),
    passingBadThrows: real("passing_bad_throws"),
    passingBadThrowPercentage: real("passing_bad_throw_percentage"),
    timesSacked: real("times_sacked"),
    timesBlitzed: real("times_blitzed"),
    timesHurried: real("times_hurried"),
    timesHit: real("times_hit"),
    timesPressured: real("times_pressured"),
    timesPressuredPercentage: real("times_pressured_percentage"),
    defensiveTimesBlitzed: real("defensive_times_blitzed"),
    defensiveTimesHurried: real("defensive_times_hurried"),
    defensiveTimesHitQuarterback: real("defensive_times_hit_quarterback"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_pass_week_unique_idx").on(t.playerId, t.gameId)],
);

export const pfrAdvRecWeek = sqliteTable(
  "pfr_adv_rec_week",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    rushingBrokenTackles: real("rushing_broken_tackles"),
    receivingBrokenTackles: real("receiving_broken_tackles"),
    passingDrops: real("passing_drops"),
    passingDropPercentage: real("passing_drop_percentage"),
    receivingDrops: real("receiving_drops"),
    receivingDropPercentage: real("receiving_drop_percentage"),
    receivingInterceptions: real("receiving_interceptions"),
    receivingPasserRating: real("receiving_passer_rating"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_rec_week_unique_idx").on(t.playerId, t.gameId)],
);

export const pfrAdvRushWeek = sqliteTable(
  "pfr_adv_rush_week",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    carries: real("carries"),
    rushingYardsBeforeContact: real("rushing_yards_before_contact"),
    rushingYardsBeforeContactAverage: real("rushing_yards_before_contact_average"),
    rushingYardsAfterContact: real("rushing_yards_after_contact"),
    rushingYardsAfterContactAverage: real("rushing_yards_after_contact_average"),
    rushingBrokenTackles: real("rushing_broken_tackles"),
    receivingBrokenTackles: real("receiving_broken_tackles"),
    ...meta(),
  },
  (t) => [uniqueIndex("pfr_adv_rush_week_unique_idx").on(t.playerId, t.gameId)],
);
