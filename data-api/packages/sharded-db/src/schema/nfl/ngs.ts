import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { player, season, team, week } from "./reference";

const meta = () => ({
  contentHash: text("content_hash"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const ngsPassing = sqliteTable(
  "ngs_passing",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    weekId: integer("week_id")
      .notNull()
      .references(() => week.id),
    averageTimeToThrow: real("average_time_to_throw"),
    averageCompletedAirYards: real("average_completed_air_yards"),
    averageIntendedAirYards: real("average_intended_air_yards"),
    averageAirYardsDifferential: real("average_air_yards_differential"),
    aggressiveness: real("aggressiveness"),
    maximumCompletedAirDistance: real("maximum_completed_air_distance"),
    averageAirYardsToSticks: real("average_air_yards_to_sticks"),
    attempts: integer("attempts"),
    passingYards: integer("passing_yards"),
    passingTouchdowns: integer("passing_touchdowns"),
    interceptions: integer("interceptions"),
    passerRating: real("passer_rating"),
    completions: integer("completions"),
    completionPercentage: real("completion_percentage"),
    expectedCompletionPercentage: real("expected_completion_percentage"),
    completionPercentageAboveExpectation: real("completion_percentage_above_expectation"),
    averageAirDistance: real("average_air_distance"),
    maximumAirDistance: real("maximum_air_distance"),
    ...meta(),
  },
  (t) => [uniqueIndex("ngs_passing_unique_idx").on(t.playerId, t.seasonId, t.weekId)],
);

export const ngsReceiving = sqliteTable(
  "ngs_receiving",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    weekId: integer("week_id")
      .notNull()
      .references(() => week.id),
    averageCushion: real("average_cushion"),
    averageSeparation: real("average_separation"),
    averageIntendedAirYards: real("average_intended_air_yards"),
    percentShareOfIntendedAirYards: real("percent_share_of_intended_air_yards"),
    receptions: integer("receptions"),
    targets: integer("targets"),
    catchPercentage: real("catch_percentage"),
    yards: integer("yards"),
    receivingTouchdowns: integer("receiving_touchdowns"),
    averageYardsAfterCatch: real("average_yards_after_catch"),
    averageExpectedYardsAfterCatch: real("average_expected_yards_after_catch"),
    averageYardsAfterCatchAboveExpectation: real("average_yards_after_catch_above_expectation"),
    ...meta(),
  },
  (t) => [uniqueIndex("ngs_receiving_unique_idx").on(t.playerId, t.seasonId, t.weekId)],
);

export const ngsRushing = sqliteTable(
  "ngs_rushing",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    weekId: integer("week_id")
      .notNull()
      .references(() => week.id),
    efficiency: real("efficiency"),
    percentAttemptsWithEightPlusDefenders: real("percent_attempts_with_eight_plus_defenders"),
    averageTimeToLineOfScrimmage: real("average_time_to_line_of_scrimmage"),
    rushingAttempts: integer("rushing_attempts"),
    rushingYards: integer("rushing_yards"),
    averageRushingYards: real("average_rushing_yards"),
    rushingTouchdowns: integer("rushing_touchdowns"),
    expectedRushingYards: real("expected_rushing_yards"),
    rushingYardsOverExpected: real("rushing_yards_over_expected"),
    rushingYardsOverExpectedPerAttempt: real("rushing_yards_over_expected_per_attempt"),
    rushingPercentageOverExpected: real("rushing_percentage_over_expected"),
    ...meta(),
  },
  (t) => [uniqueIndex("ngs_rushing_unique_idx").on(t.playerId, t.seasonId, t.weekId)],
);
