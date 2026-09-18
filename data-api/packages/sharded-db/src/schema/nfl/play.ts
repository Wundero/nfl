import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { game } from "./games";
import { player, team } from "./reference";

// flags bitfield, bits in order:
// 0 quarterEnd
// 1 scoringPlay
// 2 shotgun
// 3 noHuddle
// 4 qbDropback
// 5 qbKneel
// 6 qbSpike
// 7 qbScramble
// 8 timeout
// 9 puntBlocked
// 10 firstDownRush
// 11 firstDownPass
// 12 firstDownPenalty
// 13 thirdDownConverted
// 14 thirdDownFailed
// 15 fourthDownConverted
// 16 fourthDownFailed
// 17 incompletePass
// 18 touchback
// 19 interception
// 20 puntInsideTwenty
// 21 puntInEndzone
// 22 puntOutOfBounds
// 23 puntDowned
// 24 puntFairCatch
// 25 kickoffInsideTwenty
// 26 kickoffInEndzone
// 27 kickoffOutOfBounds
// 28 kickoffDowned
// 29 kickoffFairCatch
// flags2 bitfield, bits in order:
// 0 fumbleForced
// 1 fumbleNotForced
// 2 fumbleOutOfBounds
// 3 soloTackle
// 4 safety
// 5 penalty
// 6 tackledForLoss
// 7 fumbleLost
// 8 ownKickoffRecovery
// 9 ownKickoffRecoveryTd
// 10 qbHit
// 11 rushAttempt
// 12 passAttempt
// 13 sack
// 14 touchdown
// 15 passTouchdown
// 16 rushTouchdown
// 17 returnTouchdown
// 18 extraPointAttempt
// 19 twoPointAttempt
// 20 fieldGoalAttempt
// 21 kickoffAttempt
// 22 puntAttempt
// 23 fumble
// 24 completePass
// 25 assistTackle
// 26 lateralReception
// 27 lateralRush
// 28 lateralReturn
// 29 lateralRecovery
// flags3 bitfield, bits in order:
// 0 tackleWithAssist
// 1 replayOrChallenge
// 2 defensiveTwoPointAttempt
// 3 defensiveTwoPointConv
// 4 defensiveExtraPointAttempt
// 5 defensiveExtraPointConv
// 6 seriesSuccess
// 7 playDeleted
// 8 specialTeamsPlay
// 9 driveInside20
// 10 driveEndedWithScore
// 11 abortedPlay
// 12 success
// 13 pass
// 14 rush
// 15 firstDown
// 16 special
// 17 play
// 18 outOfBounds
export const play = sqliteTable(
  "play",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: integer("game_id").notNull().references(() => game.id),
    possessionTeamId: integer("possession_team_id").references(() => team.id),
    defensiveTeamId: integer("defensive_team_id").references(() => team.id),
    possessionType: text("possession_type"),
    flags: integer("flags"),
    flags2: integer("flags2"),
    flags3: integer("flags3"),
    yardline100: real("yardline_100"),
    quarterSecondsRemaining: real("quarter_seconds_remaining"),
    halfSecondsRemaining: real("half_seconds_remaining"),
    gameSecondsRemaining: real("game_seconds_remaining"),
    gameHalf: text("game_half"),
    drive: real("drive"),
    quarter: real("quarter"),
    down: real("down"),
    goalToGo: real("goal_to_go"),
    time: text("time"),
    yardLine: text("yardLine"),
    yardsToGo: real("yardsToGo"),
    netYards: real("netYards"),
    playDescription: text("playDescription"),
    playType: text("playType"),
    yardsGained: real("yards_gained"),
    passLength: text("pass_length"),
    passLocation: text("pass_location"),
    airYards: real("air_yards"),
    yardsAfterCatch: real("yards_after_catch"),
    runLocation: text("run_location"),
    runGap: text("run_gap"),
    fieldGoalResult: text("field_goal_result"),
    kickDistance: real("kick_distance"),
    extraPointResult: text("extra_point_result"),
    twoPointConvResult: text("two_point_conv_result"),
    posteamTimeoutsRemaining: real("posteam_timeouts_remaining"),
    defteamTimeoutsRemaining: real("defteam_timeouts_remaining"),
    noScoreProbability: real("noScoreProbability"),
    opponentFieldGoalProbability: real("opponentFieldGoalProbability"),
    opponentSafetyProbability: real("opponentSafetyProbability"),
    opponentTouchdownProbability: real("opponentTouchdownProbability"),
    fieldGoalProbability: real("fieldGoalProbability"),
    safetyProbability: real("safetyProbability"),
    touchdownProbability: real("touchdownProbability"),
    extraPointProbability: real("extraPointProbability"),
    twoPointConversionProbability: real("twoPointConversionProbability"),
    ep: real("ep"),
    expectedPointsAdded: real("expectedPointsAdded"),
    airEpa: real("air_epa"),
    yacEpa: real("yac_epa"),
    compAirEpa: real("comp_air_epa"),
    compYacEpa: real("comp_yac_epa"),
    winProbability: real("winProbability"),
    defensiveWinProbability: real("defensiveWinProbability"),
    winProbabilityAdded: real("winProbabilityAdded"),
    vegasWinProbabilityAdded: real("vegasWinProbabilityAdded"),
    vegasHomeWpa: real("vegas_home_wpa"),
    vegasWinProbability: real("vegasWinProbability"),
    vegasHomeWinProbability: real("vegasHomeWinProbability"),
    airWpa: real("air_wpa"),
    yacWpa: real("yac_wpa"),
    compAirWpa: real("comp_air_wpa"),
    compYacWpa: real("comp_yac_wpa"),
    passingYards: real("passing_yards"),
    receivingYards: real("receiving_yards"),
    rushingYards: real("rushing_yards"),
    lateralReceivingYards: real("lateral_receiving_yards"),
    lateralRushingYards: real("lateral_rushing_yards"),
    fumbleRecovery1Yards: real("fumble_recovery_1_yards"),
    fumbleRecovery2Yards: real("fumble_recovery_2_yards"),
    returnYards: real("return_yards"),
    penaltyYards: real("penalty_yards"),
    replayOrChallengeResult: text("replay_or_challenge_result"),
    penaltyType: text("penalty_type"),
    completionProbability: real("completionProbability"),
    completionPercentageOverExpected: real("completionPercentageOverExpected"),
    series: real("series"),
    seriesResult: text("series_result"),
    orderSequence: real("order_sequence"),
    playClock: text("play_clock"),
    nflPlayType: text("nflPlayType"),
    stPlayType: text("st_play_type"),
    endClockTime: text("end_clock_time"),
    endYardLine: text("end_yard_line"),
    fixedDrive: real("fixed_drive"),
    fixedDriveResult: text("fixed_drive_result"),
    driveRealStartTime: text("drive_real_start_time"),
    drivePlayCount: real("drive_play_count"),
    driveTimeOfPossession: text("drive_time_of_possession"),
    driveFirstDowns: real("drive_first_downs"),
    driveQuarterStart: real("drive_quarter_start"),
    driveQuarterEnd: real("drive_quarter_end"),
    driveYardsPenalized: real("drive_yards_penalized"),
    driveStartTransition: text("drive_start_transition"),
    driveEndTransition: text("drive_end_transition"),
    driveGameClockStart: text("drive_game_clock_start"),
    driveGameClockEnd: text("drive_game_clock_end"),
    driveStartYardLine: text("drive_start_yard_line"),
    driveEndYardLine: text("drive_end_yard_line"),
    drivePlayIdStarted: text("drive_play_id_started"),
    drivePlayIdEnded: text("drive_play_id_ended"),
    quarterbackExpectedPointsAdded: real("quarterbackExpectedPointsAdded"),
    expectedYardsAfterCatchExpectedPointsAdded: real("expectedYardsAfterCatchExpectedPointsAdded"),
    expectedYardsAfterCatchMeanYardage: real("expectedYardsAfterCatchMeanYardage"),
    expectedYardsAfterCatchMedianYardage: real("expectedYardsAfterCatchMedianYardage"),
    expectedYardsAfterCatchSuccess: real("expectedYardsAfterCatchSuccess"),
    expectedYardsAfterCatchFirstDown: real("expectedYardsAfterCatchFirstDown"),
    expectedPassRate: real("expectedPassRate"),
    passOverExpected: real("passOverExpected"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("play_game_idx").on(t.gameId),
    index("play_possession_team_idx").on(t.possessionTeamId),
    index("play_defensive_team_idx").on(t.defensiveTeamId),
    index("play_content_hash_idx").on(t.contentHash),
  ],
);

export const playTeamStats = sqliteTable(
  "play_team_stats",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playId: integer("play_id")
      .notNull()
      .references(() => play.id),
    teamId: integer("team_id")
      .notNull()
      .references(() => team.id),
    isHome: integer("is_home", { mode: "boolean" }).notNull(),
    score: integer("score"),
    scoreDifferential: integer("score_differential"),
    timeoutsRemaining: real("timeouts_remaining"),
    expectedPointsAdded: real("expected_points_added"),
    rushEpa: real("rush_epa"),
    passEpa: real("pass_epa"),
    compAirEpa: real("comp_air_epa"),
    compYacEpa: real("comp_yac_epa"),
    rawAirEpa: real("raw_air_epa"),
    rawYacEpa: real("raw_yac_epa"),
    winProbability: real("win_probability"),
    wpPost: real("wp_post"),
    rushWpa: real("rush_wpa"),
    passWpa: real("pass_wpa"),
    compAirWpa: real("comp_air_wpa"),
    compYacWpa: real("comp_yac_wpa"),
    rawAirWpa: real("raw_air_wpa"),
    rawYacWpa: real("raw_yac_wpa"),
  },
  (t) => [
    uniqueIndex("play_team_stats_unique_idx").on(t.playId, t.teamId),
    index("play_team_stats_team_idx").on(t.teamId),
  ],
);

export const playPlayer = sqliteTable(
  "play_player",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playId: integer("play_id")
      .notNull()
      .references(() => play.id),
    role: text("role").notNull(),
    slot: integer("slot"),
    playerId: integer("player_id").references(() => player.id),
    playerName: text("player_name"),
    teamId: integer("team_id").references(() => team.id),
    jerseyNumber: text("jersey_number"),
  },
  (t) => [
    index("play_player_play_idx").on(t.playId),
    index("play_player_player_idx").on(t.playerId),
    index("play_player_role_idx").on(t.role),
  ],
);

export const playTeam = sqliteTable(
  "play_team",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playId: integer("play_id")
      .notNull()
      .references(() => play.id),
    role: text("role").notNull(),
    teamId: integer("team_id").references(() => team.id),
    rawValue: text("raw_value"),
  },
  (t) => [
    index("play_team_play_idx").on(t.playId),
    index("play_team_team_idx").on(t.teamId),
    index("play_team_role_idx").on(t.role),
  ],
);
