import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { player, season, team } from "./reference";

export const trade = sqliteTable(
  "trade",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    tradeDate: integer("trade_date", { mode: "timestamp_ms" }).notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("trade_season_idx").on(t.seasonId),
    index("trade_content_hash_idx").on(t.contentHash),
  ],
);

export const tradePlayer = sqliteTable(
  "trade_player",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tradeId: integer("trade_id")
      .notNull()
      .references(() => trade.id),
    fromTeamId: integer("from_team_id").references(() => team.id),
    toTeamId: integer("to_team_id").references(() => team.id),
    tradedPlayerId: integer("traded_player_id").references(() => player.id),
    conditional: integer("conditional", { mode: "boolean" }),
  },
  (t) => [index("trade_player_trade_idx").on(t.tradeId)],
);

export const tradePick = sqliteTable(
  "trade_pick",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tradeId: integer("trade_id")
      .notNull()
      .references(() => trade.id),
    fromTeamId: integer("from_team_id").references(() => team.id),
    toTeamId: integer("to_team_id").references(() => team.id),
    pickSeason: integer("pick_season"),
    pickRound: integer("pick_round"),
    pickNumber: integer("pick_number"),
    conditional: integer("conditional", { mode: "boolean" }),
  },
  (t) => [index("trade_pick_trade_idx").on(t.tradeId)],
);
