import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { player, season, team, week } from "./reference";

export const injuryReport = sqliteTable(
  "injury_report",
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
    index("injury_report_player_idx").on(t.playerId),
    index("injury_report_team_week_idx").on(t.teamId, t.weekId),
    index("injury_report_content_hash_idx").on(t.contentHash),
  ],
);
