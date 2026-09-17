import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// TODO this set of tables is incomplete vs what I want, read thru nflverse data and build a nice schema

export const teams = sqliteTable(
  "team",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    conference: text("conference").notNull(),
    division: text("division").notNull(),
  },
  (t) => [index("team_name_idx").on(t.name)],
);

export const players = sqliteTable(
  "player",
  {
    id: text("id").primaryKey(),
    gsisId: text("gsis_id"),
    espnId: text("espn_id"),
    sleeperId: text("sleeper_id"),
    name: text("name").notNull(),
    position: text("position").notNull(),
    teamId: text("team_id").references(() => teams.id),
    draftYear: integer("draft_year"),
    draftCapital: text("draft_capital"),
    college: text("college"),
    source: text("source").notNull(), // provenance, per the licensing design
  },
  (t) => [index("player_position_idx").on(t.position), index("player_team_idx").on(t.teamId)],
);

export const games = sqliteTable(
  "game",
  {
    id: text("id").primaryKey(),
    season: integer("season").notNull(),
    week: integer("week").notNull(),
    homeTeamId: text("home_team_id").references(() => teams.id),
    awayTeamId: text("away_team_id").references(() => teams.id),
    kickoff: integer("kickoff", { mode: "timestamp" }),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    status: text("status").notNull(),
    vegasSpread: real("vegas_spread"),
    vegasTotal: real("vegas_total"),
  },
  (t) => [
    index("game_week_idx").on(t.season, t.week),
    index("game_away_idx").on(t.awayTeamId),
    index("game_home_idx").on(t.homeTeamId),
    index("game_teams_idx").on(t.homeTeamId, t.awayTeamId),
  ],
);

// Hybrid: typed columns for what you always filter/sort/score on,
// a JSON blob for the long tail — new stat categories never need a migration.
export const playerGameStats = sqliteTable(
  "player_game_stats",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    season: integer("season").notNull(),
    week: integer("week").notNull(),
    snapPct: real("snap_pct"),
    targets: integer("targets"),
    carries: integer("carries"),
    fantasyPtsStd: real("fantasy_pts_std"),
    fantasyPtsPpr: real("fantasy_pts_ppr"),
    rawStats: text("raw_stats", { mode: "json" }).$type<Record<string, number>>(),
    source: text("source").notNull(),
    versionHash: text("version_hash").notNull(), // the same diff/ETag/cache-tag marker from earlier
  },
  (t) => [
    uniqueIndex("pgs_player_week_idx").on(t.playerId, t.gameId),
    index("pgs_hash_idx").on(t.versionHash),
    index("pgs_player_idx").on(t.playerId),
    index("pgs_game_idx").on(t.gameId),
    index("pgs_team_idx").on(t.teamId),
  ],
);

export const injuryReports = sqliteTable(
  "injury_report",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    season: integer("season").notNull(),
    week: integer("week").notNull(),
    status: text("status").notNull(),
    practiceParticipation: text("practice_participation"),
    reportedAt: integer("reported_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("injury_player_idx").on(t.playerId), index("injury_team_idx").on(t.teamId)],
);

export const oddsLines = sqliteTable(
  "odds_line",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id),
    playerId: text("player_id").references(() => players.id), // set for props, null for game lines
    teamId: text("team_id").references(() => teams.id), // set for props (player team at time), null for game lines
    marketType: text("market_type").notNull(),
    line: real("line"),
    odds: integer("odds"),
    capturedAt: integer("captured_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    index("odds_game_market_idx").on(t.gameId, t.marketType, t.capturedAt),
    index("odds_player_idx").on(t.playerId),
    index("odds_game_idx").on(t.gameId),
  ],
);

// The shared version/diff/ETag/cache-tag marker from the caching + webhook design
export const syncState = sqliteTable(
  "sync_state",
  {
    resourceKey: text("resource_key").primaryKey(), // e.g. "player_game_stats:2026:4"
    versionHash: text("version_hash").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("sync_version_idx").on(t.versionHash)],
);
