import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const season = sqliteTable(
  "season",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    year: integer("year").notNull(),
  },
  (t) => [uniqueIndex("season_year_idx").on(t.year)],
);

export const week = sqliteTable(
  "week",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    number: integer("number").notNull(),
    seasonType: text("season_type").notNull(),
  },
  (t) => [uniqueIndex("week_season_number_type_idx").on(t.seasonId, t.number, t.seasonType)],
);

export const college = sqliteTable(
  "college",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [uniqueIndex("college_name_idx").on(t.name), uniqueIndex("college_slug_idx").on(t.slug)],
);

export const position = sqliteTable(
  "position",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    abbreviation: text("abbreviation").notNull(),
    name: text("name").notNull(),
    positionGroup: text("position_group").notNull(),
  },
  (t) => [uniqueIndex("position_abbreviation_idx").on(t.abbreviation)],
);

export const team = sqliteTable(
  "team",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    abbreviation: text("abbreviation").notNull(),
    name: text("name").notNull(),
    nicknames: text("nicknames", { mode: "json" }).$type<string[]>(),
    conference: text("conference").notNull(),
    division: text("division").notNull(),
    primaryColor: text("primary_color"),
    secondaryColor: text("secondary_color"),
    tertiaryColor: text("tertiary_color"),
    quaternaryColor: text("quaternary_color"),
    logoIcon: text("logo_icon"),
    logoText: text("logo_text"),
    slug: text("slug").notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("team_abbreviation_idx").on(t.abbreviation),
    uniqueIndex("team_slug_idx").on(t.slug),
    index("team_conference_idx").on(t.conference),
    index("team_division_idx").on(t.division),
    index("team_content_hash_idx").on(t.contentHash),
  ],
);

export const teamLogo = sqliteTable(
  "team_logo",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    teamId: integer("team_id")
      .notNull()
      .references(() => team.id),
    source: text("source").notNull(),
    url: text("url").notNull(),
  },
  (t) => [uniqueIndex("team_logo_team_source_idx").on(t.teamId, t.source)],
);

export const stadium = sqliteTable(
  "stadium",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    roof: text("roof"),
    surface: text("surface"),
    slug: text("slug").notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("stadium_slug_idx").on(t.slug),
    index("stadium_content_hash_idx").on(t.contentHash),
  ],
);

export const coach = sqliteTable(
  "coach",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("coach_slug_idx").on(t.slug),
    index("coach_content_hash_idx").on(t.contentHash),
  ],
);

export const official = sqliteTable(
  "official",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("official_slug_idx").on(t.slug),
    index("official_content_hash_idx").on(t.contentHash),
  ],
);

export const player = sqliteTable(
  "player",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    displayName: text("display_name").notNull(),
    birthDate: integer("birth_date", { mode: "timestamp_ms" }).notNull(),
    collegeId: integer("college_id").references(() => college.id),
    headshot: text("headshot"),
    latestHeight: integer("latest_height"),
    latestWeight: integer("latest_weight"),
    latestJerseyNumber: text("latest_jersey_number"),
    latestTeamId: integer("latest_team_id").references(() => team.id),
    status: text("status"),
    nextGenStatsStatus: text("next_gen_stats_status"),
    nextGenStatsStatusDescription: text("next_gen_stats_status_description"),
    proFootballFocusStatus: text("pro_football_focus_status"),
    slug: text("slug").notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("player_slug_idx").on(t.slug),
    index("player_team_idx").on(t.latestTeamId),
    index("player_college_idx").on(t.collegeId),
    index("player_content_hash_idx").on(t.contentHash),
  ],
);

export const playerPosition = sqliteTable(
  "player_position",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    // Null for season-level positions (season rosters); set for week-scoped positions.
    weekId: integer("week_id").references(() => week.id),
    positionId: integer("position_id").references(() => position.id),
    nextGenStatsPosition: text("next_gen_stats_position"),
    nextGenStatsPositionGroup: text("next_gen_stats_position_group"),
    proFootballFocusPosition: text("pro_football_focus_position"),
  },
  (t) => [
    index("player_position_player_idx").on(t.playerId),
    index("player_position_season_idx").on(t.seasonId),
  ],
);

export const playerBodyMeasurement = sqliteTable(
  "player_body_measurement",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    // Null for measurements not tied to a season (e.g. one-off combine measurements).
    seasonId: integer("season_id").references(() => season.id),
    source: text("source").notNull(),
    height: integer("height"),
    weight: integer("weight"),
  },
  (t) => [index("player_body_measurement_player_idx").on(t.playerId)],
);

export const playerJerseyNumber = sqliteTable(
  "player_jersey_number",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    seasonId: integer("season_id")
      .notNull()
      .references(() => season.id),
    // Null for season-scoped jersey numbers without a specific week.
    weekId: integer("week_id").references(() => week.id),
    jerseyNumber: text("jersey_number").notNull(),
  },
  (t) => [index("player_jersey_number_player_idx").on(t.playerId)],
);

export const playerCareerStats = sqliteTable(
  "player_career_stats",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    hallOfFame: integer("hall_of_fame", { mode: "boolean" }),
    allProSelections: integer("all_pro_selections"),
    proBowlSelections: integer("pro_bowl_selections"),
    seasonsStarted: integer("seasons_started"),
    gamesPlayed: integer("games_played"),
    weightedApproximateValue: integer("weighted_approximate_value"),
    careerApproximateValue: integer("career_approximate_value"),
    draftApproximateValue: integer("draft_approximate_value"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("player_career_stats_player_idx").on(t.playerId),
    index("player_career_stats_content_hash_idx").on(t.contentHash),
  ],
);

export const playerCollegeStats = sqliteTable(
  "player_college_stats",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id")
      .notNull()
      .references(() => player.id),
    passCompletions: integer("pass_completions"),
    passAttempts: integer("pass_attempts"),
    passYards: integer("pass_yards"),
    passTouchdowns: integer("pass_touchdowns"),
    passInterceptions: integer("pass_interceptions"),
    rushAttempts: integer("rush_attempts"),
    rushYards: integer("rush_yards"),
    rushTouchdowns: integer("rush_touchdowns"),
    receptions: integer("receptions"),
    receivingYards: integer("receiving_yards"),
    receivingTouchdowns: integer("receiving_touchdowns"),
    defensiveSoloTackles: integer("defensive_solo_tackles"),
    defensiveInterceptions: integer("defensive_interceptions"),
    defensiveSacks: integer("defensive_sacks"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("player_college_stats_player_idx").on(t.playerId),
    index("player_college_stats_content_hash_idx").on(t.contentHash),
  ],
);
