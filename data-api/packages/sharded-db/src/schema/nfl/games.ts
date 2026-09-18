import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { coach, official, player, season, stadium, team } from "./reference";

export const game = sqliteTable(
  "game",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    week: integer("week").notNull(),
    gameType: text("game_type").notNull(),
    gameday: integer("gameday", { mode: "timestamp_ms" }).notNull(),
    weekday: text("weekday").notNull(),
    gametime: text("gametime"),
    awayTeamId: integer("away_team_id").references(() => team.id),
    homeTeamId: integer("home_team_id").references(() => team.id),
    awayScore: integer("away_score"),
    homeScore: integer("home_score"),
    location: text("location"),
    result: integer("result"),
    total: integer("total"),
    overtime: integer("overtime", { mode: "boolean" }),
    awayRest: integer("away_rest"),
    homeRest: integer("home_rest"),
    awayMoneyline: integer("away_moneyline"),
    homeMoneyline: integer("home_moneyline"),
    spreadLine: real("spread_line"),
    awaySpreadOdds: integer("away_spread_odds"),
    homeSpreadOdds: integer("home_spread_odds"),
    totalLine: real("total_line"),
    underOdds: integer("under_odds"),
    overOdds: integer("over_odds"),
    divGame: integer("div_game", { mode: "boolean" }),
    stadiumId: integer("stadium_id").references(() => stadium.id),
    weather: text("weather"),
    headOfficialId: integer("head_official_id").references(() => official.id),
    slug: text("slug").notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("game_slug_idx").on(t.slug),
    index("game_season_week_idx").on(t.seasonId, t.week),
    index("game_home_team_idx").on(t.homeTeamId),
    index("game_away_team_idx").on(t.awayTeamId),
    index("game_stadium_idx").on(t.stadiumId),
    index("game_content_hash_idx").on(t.contentHash),
  ],
);

export const gameParticipant = sqliteTable(
  "game_participant",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    teamId: integer("team_id").references(() => team.id),
    role: text("role").notNull(),
  },
  (t) => [
    uniqueIndex("game_participant_unique_idx").on(t.gameId, t.playerId, t.role),
    index("game_participant_player_idx").on(t.playerId),
  ],
);

export const gameCoach = sqliteTable(
  "game_coach",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    coachId: integer("coach_id")
      .notNull()
      .references(() => coach.id),
    teamId: integer("team_id").references(() => team.id),
    role: text("role").notNull(),
  },
  (t) => [uniqueIndex("game_coach_unique_idx").on(t.gameId, t.coachId, t.role)],
);

export const gameOfficial = sqliteTable(
  "game_official",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    officialId: integer("official_id")
      .notNull()
      .references(() => official.id),
    position: text("position"),
    jerseyNumber: text("jersey_number"),
  },
  (t) => [uniqueIndex("game_official_unique_idx").on(t.gameId, t.officialId)],
);
