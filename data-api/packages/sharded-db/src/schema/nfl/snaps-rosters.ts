import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { game } from "./games";
import { player, position, season, team, week } from "./reference";

export const snapCount = sqliteTable(
  "snap_count",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    positionId: integer("position_id").references(() => position.id),
    offenseSnaps: integer("offense_snaps"),
    offensePercentage: real("offense_percentage"),
    defenseSnaps: integer("defense_snaps"),
    defensePercentage: real("defense_percentage"),
    specialTeamsSnaps: integer("special_teams_snaps"),
    specialTeamsPercentage: real("special_teams_percentage"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("snap_count_player_game_idx").on(t.playerId, t.gameId),
    index("snap_count_content_hash_idx").on(t.contentHash),
  ],
);

export const rosterDepthChart = sqliteTable(
  "roster_depth_chart",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    // Null for season-level roster entries that are not tied to a specific week.
    weekId: integer("week_id").references(() => week.id),
    gameType: text("game_type"),
    formation: text("formation"),
    depthTeam: text("depth_team"),
    positionId: integer("position_id").references(() => position.id),
    depthPosition: text("depth_position"),
    slot: integer("slot"),
    rank: integer("rank"),
    status: text("status"),
    statusDescriptionAbbreviation: text("status_description_abbreviation"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("roster_depth_chart_player_idx").on(t.playerId),
    index("roster_depth_chart_team_week_idx").on(t.teamId, t.seasonId, t.weekId),
    index("roster_depth_chart_content_hash_idx").on(t.contentHash),
  ],
);
