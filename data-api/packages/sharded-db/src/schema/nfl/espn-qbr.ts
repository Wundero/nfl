import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { game } from "./games";
import { player, season } from "./reference";

const metrics = () => ({
  rank: real("rank"),
  qualified: integer("qualified", { mode: "boolean" }),
  totalQbr: real("total_qbr"),
  pointsAdded: real("points_added"),
  quarterbackPlays: real("quarterback_plays"),
  expectedPointsAddedTotal: real("expected_points_added_total"),
  passing: real("passing"),
  rushing: real("rushing"),
  expectedSacks: real("expected_sacks"),
  penalty: real("penalty"),
  rawQbr: real("raw_qbr"),
  sacks: real("sacks"),
  contentHash: text("content_hash"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const espnQbrSeason = sqliteTable(
  "espn_qbr_season",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    seasonType: text("season_type").notNull(),
    ...metrics(),
  },
  (t) => [uniqueIndex("espn_qbr_season_unique_idx").on(t.playerId, t.seasonId, t.seasonType)],
);

export const espnQbrWeek = sqliteTable(
  "espn_qbr_week",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    gameId: integer("game_id").references(() => game.id),
    ...metrics(),
  },
  (t) => [uniqueIndex("espn_qbr_week_unique_idx").on(t.playerId, t.gameId)],
);
