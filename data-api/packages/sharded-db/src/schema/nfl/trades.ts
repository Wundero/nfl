import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { team } from "./reference";

export const trade = sqliteTable(
  "trade",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gaveTeamId: integer("gave_team_id").references(() => team.id),
    receivedTeamId: integer("received_team_id").references(() => team.id),
    season: integer("season"),
    tradeDate: integer("trade_date", { mode: "timestamp_ms" }),
    pickSeason: integer("pick_season"),
    pickRound: integer("pick_round"),
    pickNumber: integer("pick_number"),
    conditional: integer("conditional", { mode: "boolean" }),
    pfrId: text("pfr_id"),
    pfrName: text("pfr_name"),
  },
  (t) => [index("trade_season_idx").on(t.season)],
);
