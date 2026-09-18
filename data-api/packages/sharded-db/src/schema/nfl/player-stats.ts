import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { game } from "./games";
import { player, season, team } from "./reference";

const commonGame = () => ({
  id: integer("id").primaryKey({ autoIncrement: true }),
});
const meta = () => ({
  contentHash: text("content_hash"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const playerGamePassingStats = sqliteTable(
  "player_game_passing_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    completions: integer("completions"),
    attempts: integer("attempts"),
    passingYards: integer("passing_yards"),
    passingTouchdowns: integer("passing_touchdowns"),
    passingInterceptions: integer("passing_interceptions"),
    sacksSuffered: integer("sacks_suffered"),
    sackYardsLost: integer("sack_yards_lost"),
    sackFumbles: integer("sack_fumbles"),
    sackFumblesLost: integer("sack_fumbles_lost"),
    passingAirYards: integer("passing_air_yards"),
    passingYardsAfterCatch: integer("passing_yards_after_catch"),
    passingFirstDowns: integer("passing_first_downs"),
    passingExpectedPointsAdded: real("passing_expected_points_added"),
    completionPercentageOverExpected: real("completion_percentage_over_expected"),
    passingTwoPointConversions: integer("passing_two_point_conversions"),
    passingAirConversionRatio: real("passing_air_conversion_ratio"),
    passes10Yards: integer("passes_10_yards"),
    passes16Yards: integer("passes_16_yards"),
    passes20Yards: integer("passes_20_yards"),
    passes40Yards: integer("passes_40_yards"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_passing_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonPassingStats = sqliteTable(
  "player_season_passing_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    completions: integer("completions"),
    attempts: integer("attempts"),
    passingYards: integer("passing_yards"),
    passingTouchdowns: integer("passing_touchdowns"),
    passingInterceptions: integer("passing_interceptions"),
    sacksSuffered: integer("sacks_suffered"),
    sackYardsLost: integer("sack_yards_lost"),
    sackFumbles: integer("sack_fumbles"),
    sackFumblesLost: integer("sack_fumbles_lost"),
    passingAirYards: integer("passing_air_yards"),
    passingYardsAfterCatch: integer("passing_yards_after_catch"),
    passingFirstDowns: integer("passing_first_downs"),
    passingExpectedPointsAdded: real("passing_expected_points_added"),
    completionPercentageOverExpected: real("completion_percentage_over_expected"),
    passingTwoPointConversions: integer("passing_two_point_conversions"),
    passingAirConversionRatio: real("passing_air_conversion_ratio"),
    passes10Yards: integer("passes_10_yards"),
    passes16Yards: integer("passes_16_yards"),
    passes20Yards: integer("passes_20_yards"),
    passes40Yards: integer("passes_40_yards"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_passing_unique_idx").on(t.playerId, t.seasonId)],
);

export const playerGameRushingStats = sqliteTable(
  "player_game_rushing_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    carries: integer("carries"),
    rushingYards: integer("rushing_yards"),
    rushingTouchdowns: integer("rushing_touchdowns"),
    rushingFumbles: integer("rushing_fumbles"),
    rushingFumblesLost: integer("rushing_fumbles_lost"),
    rushingFirstDowns: integer("rushing_first_downs"),
    rushingExpectedPointsAdded: real("rushing_expected_points_added"),
    rushingTwoPointConversions: integer("rushing_two_point_conversions"),
    rushes10Yards: integer("rushes_10_yards"),
    rushes12Yards: integer("rushes_12_yards"),
    rushes20Yards: integer("rushes_20_yards"),
    rushes40Yards: integer("rushes_40_yards"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_rushing_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonRushingStats = sqliteTable(
  "player_season_rushing_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    carries: integer("carries"),
    rushingYards: integer("rushing_yards"),
    rushingTouchdowns: integer("rushing_touchdowns"),
    rushingFumbles: integer("rushing_fumbles"),
    rushingFumblesLost: integer("rushing_fumbles_lost"),
    rushingFirstDowns: integer("rushing_first_downs"),
    rushingExpectedPointsAdded: real("rushing_expected_points_added"),
    rushingTwoPointConversions: integer("rushing_two_point_conversions"),
    rushes10Yards: integer("rushes_10_yards"),
    rushes12Yards: integer("rushes_12_yards"),
    rushes20Yards: integer("rushes_20_yards"),
    rushes40Yards: integer("rushes_40_yards"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_rushing_unique_idx").on(t.playerId, t.seasonId)],
);

export const playerGameReceivingStats = sqliteTable(
  "player_game_receiving_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    receptions: integer("receptions"),
    targets: integer("targets"),
    receivingYards: integer("receiving_yards"),
    receivingTouchdowns: integer("receiving_touchdowns"),
    receivingFumbles: integer("receiving_fumbles"),
    receivingFumblesLost: integer("receiving_fumbles_lost"),
    receivingAirYards: integer("receiving_air_yards"),
    receivingYardsAfterCatch: integer("receiving_yards_after_catch"),
    receivingFirstDowns: integer("receiving_first_downs"),
    receivingExpectedPointsAdded: real("receiving_expected_points_added"),
    receivingTwoPointConversions: integer("receiving_two_point_conversions"),
    receptions10Yards: integer("receptions_10_yards"),
    receptions16Yards: integer("receptions_16_yards"),
    receptions20Yards: integer("receptions_20_yards"),
    receptions40Yards: integer("receptions_40_yards"),
    receivingAirConversionRatio: real("receiving_air_conversion_ratio"),
    targetShare: real("target_share"),
    airYardsShare: real("air_yards_share"),
    weightedOpportunityRating: real("weighted_opportunity_rating"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_receiving_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonReceivingStats = sqliteTable(
  "player_season_receiving_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    receptions: integer("receptions"),
    targets: integer("targets"),
    receivingYards: integer("receiving_yards"),
    receivingTouchdowns: integer("receiving_touchdowns"),
    receivingFumbles: integer("receiving_fumbles"),
    receivingFumblesLost: integer("receiving_fumbles_lost"),
    receivingAirYards: integer("receiving_air_yards"),
    receivingYardsAfterCatch: integer("receiving_yards_after_catch"),
    receivingFirstDowns: integer("receiving_first_downs"),
    receivingExpectedPointsAdded: real("receiving_expected_points_added"),
    receivingTwoPointConversions: integer("receiving_two_point_conversions"),
    receptions10Yards: integer("receptions_10_yards"),
    receptions16Yards: integer("receptions_16_yards"),
    receptions20Yards: integer("receptions_20_yards"),
    receptions40Yards: integer("receptions_40_yards"),
    receivingAirConversionRatio: real("receiving_air_conversion_ratio"),
    targetShare: real("target_share"),
    airYardsShare: real("air_yards_share"),
    weightedOpportunityRating: real("weighted_opportunity_rating"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_receiving_unique_idx").on(t.playerId, t.seasonId)],
);

export const playerGameDefenseStats = sqliteTable(
  "player_game_defense_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    soloTackles: real("solo_tackles"),
    tacklesWithAssist: real("tackles_with_assist"),
    tackleAssists: real("tackle_assists"),
    tacklesForLoss: real("tackles_for_loss"),
    tacklesForLossYards: real("tackles_for_loss_yards"),
    fumblesForced: integer("fumbles_forced"),
    sacks: real("sacks"),
    sackYards: real("sack_yards"),
    quarterbackHits: real("quarterback_hits"),
    interceptions: real("interceptions"),
    interceptionYards: real("interception_yards"),
    passesDefended: real("passes_defended"),
    defensiveTouchdowns: real("defensive_touchdowns"),
    fumblesRecovered: real("fumbles_recovered"),
    safeties: real("safeties"),
    puntsBlocked: real("punts_blocked"),
    pointAfterTouchdownsBlocked: real("point_after_touchdowns_blocked"),
    fieldGoalsBlocked: real("field_goals_blocked"),
    defensiveTwoPointAttempts: real("defensive_two_point_attempts"),
    defensiveTwoPointConversions: real("defensive_two_point_conversions"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_defense_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonDefenseStats = sqliteTable(
  "player_season_defense_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    soloTackles: real("solo_tackles"),
    tacklesWithAssist: real("tackles_with_assist"),
    tackleAssists: real("tackle_assists"),
    tacklesForLoss: real("tackles_for_loss"),
    tacklesForLossYards: real("tackles_for_loss_yards"),
    fumblesForced: integer("fumbles_forced"),
    sacks: real("sacks"),
    sackYards: real("sack_yards"),
    quarterbackHits: real("quarterback_hits"),
    interceptions: real("interceptions"),
    interceptionYards: real("interception_yards"),
    passesDefended: real("passes_defended"),
    defensiveTouchdowns: real("defensive_touchdowns"),
    fumblesRecovered: real("fumbles_recovered"),
    safeties: real("safeties"),
    puntsBlocked: real("punts_blocked"),
    pointAfterTouchdownsBlocked: real("point_after_touchdowns_blocked"),
    fieldGoalsBlocked: real("field_goals_blocked"),
    defensiveTwoPointAttempts: real("defensive_two_point_attempts"),
    defensiveTwoPointConversions: real("defensive_two_point_conversions"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_defense_unique_idx").on(t.playerId, t.seasonId)],
);

export const playerGameKickingStats = sqliteTable(
  "player_game_kicking_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    fieldGoalsMade: real("field_goals_made"),
    fieldGoalAttempts: real("field_goal_attempts"),
    fieldGoalsMissed: real("field_goals_missed"),
    fieldGoalsBlocked: real("field_goals_blocked"),
    longestFieldGoal: real("longest_field_goal"),
    fieldGoalPercentage: real("field_goal_percentage"),
    fieldGoalsMade0to19: real("field_goals_made_0_to_19"),
    fieldGoalsMade20to29: real("field_goals_made_20_to_29"),
    fieldGoalsMade30to39: real("field_goals_made_30_to_39"),
    fieldGoalsMade40to49: real("field_goals_made_40_to_49"),
    fieldGoalsMade50to59: real("field_goals_made_50_to_59"),
    fieldGoalsMade60Plus: real("field_goals_made_60_plus"),
    fieldGoalsMissed0to19: real("field_goals_missed_0_to_19"),
    fieldGoalsMissed20to29: real("field_goals_missed_20_to_29"),
    fieldGoalsMissed30to39: real("field_goals_missed_30_to_39"),
    fieldGoalsMissed40to49: real("field_goals_missed_40_to_49"),
    fieldGoalsMissed50to59: real("field_goals_missed_50_to_59"),
    fieldGoalsMissed60Plus: real("field_goals_missed_60_plus"),
    fieldGoalsMadeDistances: text("field_goals_made_distances", { mode: "json" }).$type<number[]>(),
    fieldGoalsMissedDistances: text("field_goals_missed_distances", { mode: "json" }).$type<
      number[]
    >(),
    fieldGoalsBlockedDistances: text("field_goals_blocked_distances", { mode: "json" }).$type<
      number[]
    >(),
    fieldGoalsMadeTotalYards: real("field_goals_made_total_yards"),
    fieldGoalsMissedTotalYards: real("field_goals_missed_total_yards"),
    fieldGoalsBlockedTotalYards: real("field_goals_blocked_total_yards"),
    pointAfterTouchdownsMade: real("point_after_touchdowns_made"),
    pointAfterTouchdownAttempts: real("point_after_touchdown_attempts"),
    pointAfterTouchdownsMissed: real("point_after_touchdowns_missed"),
    pointAfterTouchdownsBlocked: real("point_after_touchdowns_blocked"),
    pointAfterTouchdownPercentage: real("point_after_touchdown_percentage"),
    gameWinningFieldGoalsMade: real("game_winning_field_goals_made"),
    gameWinningFieldGoalAttempts: real("game_winning_field_goal_attempts"),
    gameWinningFieldGoalsMissed: real("game_winning_field_goals_missed"),
    gameWinningFieldGoalsBlocked: real("game_winning_field_goals_blocked"),
    gameWinningFieldGoalDistance: real("game_winning_field_goal_distance"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_kicking_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonKickingStats = sqliteTable(
  "player_season_kicking_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    fieldGoalsMade: real("field_goals_made"),
    fieldGoalAttempts: real("field_goal_attempts"),
    fieldGoalsMissed: real("field_goals_missed"),
    fieldGoalsBlocked: real("field_goals_blocked"),
    longestFieldGoal: real("longest_field_goal"),
    fieldGoalPercentage: real("field_goal_percentage"),
    fieldGoalsMade0to19: real("field_goals_made_0_to_19"),
    fieldGoalsMade20to29: real("field_goals_made_20_to_29"),
    fieldGoalsMade30to39: real("field_goals_made_30_to_39"),
    fieldGoalsMade40to49: real("field_goals_made_40_to_49"),
    fieldGoalsMade50to59: real("field_goals_made_50_to_59"),
    fieldGoalsMade60Plus: real("field_goals_made_60_plus"),
    fieldGoalsMissed0to19: real("field_goals_missed_0_to_19"),
    fieldGoalsMissed20to29: real("field_goals_missed_20_to_29"),
    fieldGoalsMissed30to39: real("field_goals_missed_30_to_39"),
    fieldGoalsMissed40to49: real("field_goals_missed_40_to_49"),
    fieldGoalsMissed50to59: real("field_goals_missed_50_to_59"),
    fieldGoalsMissed60Plus: real("field_goals_missed_60_plus"),
    fieldGoalsMadeDistances: text("field_goals_made_distances", { mode: "json" }).$type<number[]>(),
    fieldGoalsMissedDistances: text("field_goals_missed_distances", { mode: "json" }).$type<
      number[]
    >(),
    fieldGoalsBlockedDistances: text("field_goals_blocked_distances", { mode: "json" }).$type<
      number[]
    >(),
    fieldGoalsMadeTotalYards: real("field_goals_made_total_yards"),
    fieldGoalsMissedTotalYards: real("field_goals_missed_total_yards"),
    fieldGoalsBlockedTotalYards: real("field_goals_blocked_total_yards"),
    pointAfterTouchdownsMade: real("point_after_touchdowns_made"),
    pointAfterTouchdownAttempts: real("point_after_touchdown_attempts"),
    pointAfterTouchdownsMissed: real("point_after_touchdowns_missed"),
    pointAfterTouchdownsBlocked: real("point_after_touchdowns_blocked"),
    pointAfterTouchdownPercentage: real("point_after_touchdown_percentage"),
    gameWinningFieldGoalsMade: real("game_winning_field_goals_made"),
    gameWinningFieldGoalAttempts: real("game_winning_field_goal_attempts"),
    gameWinningFieldGoalsMissed: real("game_winning_field_goals_missed"),
    gameWinningFieldGoalsBlocked: real("game_winning_field_goals_blocked"),
    gameWinningFieldGoalDistances: text("game_winning_field_goal_distances", {
      mode: "json",
    }).$type<number[]>(),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_kicking_unique_idx").on(t.playerId, t.seasonId)],
);

export const playerGamePuntingStats = sqliteTable(
  "player_game_punting_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    puntsAttempted: real("punts_attempted"),
    puntsBlocked: real("punts_blocked"),
    longestPunt: real("longest_punt"),
    puntYards: real("punt_yards"),
    puntsInside20: real("punts_inside_20"),
    puntsOutOfBounds: real("punts_out_of_bounds"),
    puntsDowned: real("punts_downed"),
    puntsTouchback: real("punts_touchback"),
    puntsFairCaught: real("punts_fair_caught"),
    puntsReturned: real("punts_returned"),
    puntReturnYards: real("punt_return_yards"),
    puntReturnTouchdowns: real("punt_return_touchdowns"),
    netPuntYards: real("net_punt_yards"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_punting_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonPuntingStats = sqliteTable(
  "player_season_punting_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    puntsAttempted: real("punts_attempted"),
    puntsBlocked: real("punts_blocked"),
    longestPunt: real("longest_punt"),
    puntYards: real("punt_yards"),
    puntsInside20: real("punts_inside_20"),
    puntsOutOfBounds: real("punts_out_of_bounds"),
    puntsDowned: real("punts_downed"),
    puntsTouchback: real("punts_touchback"),
    puntsFairCaught: real("punts_fair_caught"),
    puntsReturned: real("punts_returned"),
    puntReturnYards: real("punt_return_yards"),
    puntReturnTouchdowns: real("punt_return_touchdowns"),
    netPuntYards: real("net_punt_yards"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_punting_unique_idx").on(t.playerId, t.seasonId)],
);

export const playerGameReturnStats = sqliteTable(
  "player_game_return_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    puntReturns: real("punt_returns"),
    puntReturnYards: real("punt_return_yards"),
    kickoffReturns: real("kickoff_returns"),
    kickoffReturnYards: real("kickoff_return_yards"),
    specialTeamsTouchdowns: integer("special_teams_touchdowns"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_return_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonReturnStats = sqliteTable(
  "player_season_return_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    puntReturns: real("punt_returns"),
    puntReturnYards: real("punt_return_yards"),
    kickoffReturns: real("kickoff_returns"),
    kickoffReturnYards: real("kickoff_return_yards"),
    specialTeamsTouchdowns: integer("special_teams_touchdowns"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_return_unique_idx").on(t.playerId, t.seasonId)],
);

export const playerGameMiscStats = sqliteTable(
  "player_game_misc_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    miscellaneousYards: real("miscellaneous_yards"),
    fumbleRecoveryOwn: real("fumble_recovery_own"),
    fumbleRecoveryYardsOwn: real("fumble_recovery_yards_own"),
    fumbleRecoveryOpponent: real("fumble_recovery_opponent"),
    fumbleRecoveryYardsOpponent: real("fumble_recovery_yards_opponent"),
    fumbleRecoveryTouchdowns: real("fumble_recovery_touchdowns"),
    penalties: real("penalties"),
    penaltyYards: real("penalty_yards"),
    timeouts: real("timeouts"),
    fumblesForcedByOpponent: real("fumbles_forced_by_opponent"),
    fumblesNotForced: real("fumbles_not_forced"),
    fumblesOutOfBounds: real("fumbles_out_of_bounds"),
    fumblesTotal: real("fumbles_total"),
    fumblesLostTotal: real("fumbles_lost_total"),
    fantasyPoints: real("fantasy_points"),
    fantasyPointsPpr: real("fantasy_points_ppr"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_game_misc_unique_idx").on(t.playerId, t.gameId)],
);

export const playerSeasonMiscStats = sqliteTable(
  "player_season_misc_stats",
  {
    ...commonGame(),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    miscellaneousYards: real("miscellaneous_yards"),
    fumbleRecoveryOwn: real("fumble_recovery_own"),
    fumbleRecoveryYardsOwn: real("fumble_recovery_yards_own"),
    fumbleRecoveryOpponent: real("fumble_recovery_opponent"),
    fumbleRecoveryYardsOpponent: real("fumble_recovery_yards_opponent"),
    fumbleRecoveryTouchdowns: real("fumble_recovery_touchdowns"),
    penalties: real("penalties"),
    penaltyYards: real("penalty_yards"),
    timeouts: real("timeouts"),
    fumblesForcedByOpponent: real("fumbles_forced_by_opponent"),
    fumblesNotForced: real("fumbles_not_forced"),
    fumblesOutOfBounds: real("fumbles_out_of_bounds"),
    fumblesTotal: real("fumbles_total"),
    fumblesLostTotal: real("fumbles_lost_total"),
    fantasyPoints: real("fantasy_points"),
    fantasyPointsPpr: real("fantasy_points_ppr"),
    ...meta(),
  },
  (t) => [uniqueIndex("player_season_misc_unique_idx").on(t.playerId, t.seasonId)],
);
