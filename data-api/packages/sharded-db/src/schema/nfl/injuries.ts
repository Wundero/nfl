import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { player, team } from "./reference";

export const injury_report = sqliteTable(
  "injury_report",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id").references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    season: integer("season"),
    gameType: text("game_type").notNull(),
    seasonType: text("season_type").notNull(),
    week: real("week"),
    position: text("position"),
    fullName: text("full_name"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    reportPrimaryInjury: text("report_primary_injury"),
    reportSecondaryInjury: text("report_secondary_injury"),
    reportStatus: text("report_status"),
    practicePrimaryInjury: text("practice_primary_injury"),
    practiceSecondaryInjury: text("practice_secondary_injury"),
    practiceStatus: text("practice_status"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("inj_player_idx").on(t.playerId),
    index("inj_team_week_idx").on(t.teamId, t.season, t.week),
  ],
);
