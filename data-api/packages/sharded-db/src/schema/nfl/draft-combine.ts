import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { college, player, position, season, team } from "./reference";

export const draftPick = sqliteTable(
  "draft_pick",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    round: integer("round").notNull(),
    pick: integer("pick").notNull(),
    teamId: integer("team_id").references(() => team.id),
    playerId: integer("player_id").references(() => player.id),
    collegeId: integer("college_id").references(() => college.id),
    positionId: integer("position_id").references(() => position.id),
    ageWhenDrafted: integer("age_when_drafted"),
    side: text("side"),
  },
  (t) => [
    index("draft_pick_season_idx").on(t.seasonId),
    index("draft_pick_player_idx").on(t.playerId),
  ],
);

export const combineResult = sqliteTable(
  "combine_result",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id").references(() => player.id),
    collegeId: integer("college_id").references(() => college.id),
    draftPickId: integer("draft_pick_id").references(() => draftPick.id),
    position: text("position"),
    fortyYardDash: real("forty_yard_dash"),
    benchPress: real("bench_press"),
    verticalJump: real("vertical_jump"),
    broadJump: real("broad_jump"),
    threeConeDrill: real("three_cone_drill"),
    twentyYardShuttle: real("twenty_yard_shuttle"),
  },
  (t) => [index("combine_result_player_idx").on(t.playerId)],
);
