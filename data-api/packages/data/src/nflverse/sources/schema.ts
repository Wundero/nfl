import { z } from "zod";

const nullishIntTx = z.transform((v) => {
  if (v === 0) {
    return 0;
  }
  if (!v) {
    return null;
  }
  if (typeof v === "string") {
    if (!v.trim().length) {
      return null;
    }
    const value = Number.parseInt(v);
    if (Number.isNaN(value)) {
      return null;
    }
    return value;
  }
  if (typeof v === "bigint") {
    return Number(v);
  }
  if (typeof v === "number") {
    if (Number.isSafeInteger(v)) {
      return v;
    }
  }
  return null;
});

const nullishFloatTx = z.transform((v) => {
  if (v === 0) {
    return 0;
  }
  if (!v) {
    return null;
  }
  if (typeof v === "string") {
    if (!v.trim().length) {
      return null;
    }
    const value = Number.parseFloat(v);
    if (Number.isNaN(value)) {
      return null;
    }
    return value;
  }
  if (typeof v === "bigint") {
    return Number(v);
  }
  if (typeof v === "number") {
    return v;
  }
  return null;
});

const boolZ1 = z.preprocess(
  (v) => {
    if (v === 0) {
      return false;
    }
    if (v == null) {
      return false;
    }
    if (v == undefined) {
      return false;
    }
    if (typeof v === "number") {
      return !!v;
    }
    return v;
  },
  z.union([z.stringbool(), z.boolean()]),
);
const boolZ1N = z.preprocess(
  (v) => {
    if (v === 0) {
      return false;
    }
    if (v == null) {
      return null;
    }
    if (v == undefined) {
      return null;
    }
    if (typeof v === "number") {
      return !!v;
    }
    return v;
  },
  z.union([z.stringbool(), z.boolean(), z.null()]),
);

const nullishString = z.transform((v) => {
  if (typeof v !== "string") {
    if (v == null || v == undefined) {
      return null;
    }
  }
  const v2 = String(v).trim();
  if (!v2) {
    return null;
  }
  return v2;
});

const nullishStringSub = <T extends z.ZodType<unknown, string>>(sch: T) =>
  z.pipe(nullishString, z.union([z.null(), sch]));

const hexColorSchema = z.coerce.string().regex(/^#[A-Fa-f0-9]{6}$/);

const hexColorSchemaNullish = z.preprocess(
  (v) => {
    if (!v) {
      return null;
    }
    return v;
  },
  z.union([z.null(), hexColorSchema]),
);

const coercedUrl = z.pipe(z.coerce.string(), z.url());

const tradeSchema = z
  .object({
    trade_id: z.coerce.number().int().describe("The ID of the trade"),
    season: z.coerce.number().int().describe("The season (year) when the trade happened"),
    trade_date: z.pipe(z.coerce.string(), z.iso.date()).describe("The date of the trade"),
    gave: z.coerce.string().describe("The team (Abbreviation) which sent the resource"),
    received: z.coerce.string().describe("The team (Abbreviation) which received the resource"),
    pick_season: nullishIntTx.describe("The year the draft pick is for. Null = no pick traded."),
    pick_round: nullishIntTx.describe(
      "The round of the draft the pick is in. Null = no pick traded.",
    ),
    pick_number: nullishIntTx.describe(
      "The absolute number of the pick in the draft of that year. Null = no pick traded.",
    ),
    conditional: boolZ1N.describe("Whether the pick traded is conditional. Null = no pick traded."),
    pfr_id: nullishString.describe(
      "Pro football reference player ID, if known. Null = either no player traded OR PFR doesn't have this player ID.",
    ),
    pfr_name: nullishString.describe(
      "The name of the player who was traded. Null = no player traded.",
    ),
  })
  .describe("A traded resource (either a player, a pick, or both in one row)");

const teamsSchema = z
  .object({
    team_abbr: z.coerce.string().describe("The team's abbreviation, e.g. ARI = Arizona Cardinals"),
    team_name: z.coerce.string().describe("The team's full name, e.g. Arizona Cardinals"),
    team_id: z.coerce.number().int().describe("The team's nflverse ID, e.g. 3800."),
    team_nick: z.coerce.string().describe("The team's short name, e.g. Cardinals."),
    team_conf: z.coerce.string().describe("The team's conference, e.g. NFC"),
    team_division: z.coerce.string().describe("The team's division, e.g. NFC West"),
    team_color: hexColorSchema.describe("The team's primary color, as a hex color (e.g. #97233F)"),
    team_color2: hexColorSchema.describe(
      "The team's secondary color, as a hex color (e.g. #FFB612)",
    ),
    team_color3: hexColorSchemaNullish.describe(
      "The team's tertiary color, as a hex color. Null = no tertiary color defined.",
    ),
    team_color4: hexColorSchemaNullish.describe(
      "The team's quaternary color, as a hex color. Null = no quaternary color defined.",
    ),
    team_logo_wikipedia: coercedUrl.describe("The team's Wikipedia Logo URI, may be invalid."),
    team_logo_espn: coercedUrl.describe("The team's ESPN logo URI"),
    team_wordmark: coercedUrl.describe("The team's NFL Verse Wordmark image URI"),
    team_logo_squared: coercedUrl.describe("The team's NFL Verse Square Logo image URI"),
    team_conference_logo: coercedUrl.describe("The conference's NFL Verse logo URI"),
    team_league_logo: coercedUrl.describe("The league's NFL Verse Logo URI"),
  })
  .describe("An NFL team");

const gamesSchema = z
  .object({
    game_id: z.coerce
      .string()
      .describe(
        "NFL Verse ID of the game, formatted as YEAR_WEEK_AWAYTEAMABBR_HOMETEAMABBR (e.g. 2023_01_ARI_WAS).",
      ),
    season: z.coerce.number().int().describe("Season (year) the game took place"),
    // The type of the game. REG = regular season game, WC = wildcard playoff game, DIV = divisional round playoff game,
    //  CON = conference championship game, SB = superbowl game
    game_type: z
      .pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"]))
      .describe(
        "The type of game being played. Values: REG=regular season game, " +
          "WC=wildcard playoff game, DIV=divisional round playoff game, CON=conference championship playoff game, SB=superbowl playoff final game",
      ),
    // The week number of the season game, 1..22 or so
    week: z.coerce.number().int().describe("The week of the season the game took place (1-22)."),
    // The ISO date of the game
    gameday: z.pipe(z.coerce.string(), z.iso.date()).describe("The date the game took place."),
    // The day of the week the game was played on
    weekday: z
      .pipe(
        z.coerce.string(),
        z.enum(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
      )
      .describe("The day of the week the game took place."),
    // The time of day the game was played on (I think EST? not sure though)
    gametime: nullishString.describe(
      "The scheduled kickoff time of day, in 24-hour HH:MM format. Null = unknown.",
    ),
    // The away team abbreviation
    away_team: z.coerce.string().describe("Team abbreviation of the away team"),
    // The score the away team got (null if not yet played)
    away_score: nullishIntTx.describe("The score the away team got. Null = not yet played."),
    // The home team abbreviation
    home_team: z.coerce.string().describe("Team abbreviation of the home team"),
    // The score the home team got (null if not yet played)
    home_score: nullishIntTx.describe("The score the home team got. Null = not yet played."),
    // Where the game was played for the home team (either at home or in a neutral stadium, away inverses to home)
    location: z
      .pipe(z.coerce.string(), z.enum(["Home", "Neutral"]))
      .describe("Whether the game was played at home (for the home team) or in a neutral stadium."),
    // Result = home score - away score
    result: nullishIntTx.describe("The resulting score of the game. Equal to home-away."),
    // Total = home score + away score
    total: nullishIntTx.describe("Total points scored in the game. Equal to home+away."),
    // Whether the game went into overtime
    overtime: boolZ1N.describe("Whether the game went into overtime."),
    // Previously used game ids (one number, YEARMONTHDAYNUMBER, not as obvious what the NUMBER is)
    old_game_id: z.coerce.number().int().describe(
      "The previously used NFL Verse game ID, a single number in YEARMONTHDAYNUMBER format; the meaning of the trailing NUMBER is undocumented.",
    ),
    // NFL GSIS ID
    gsis: nullishIntTx.describe("NFL Game Statistics & Information System (GSIS) ID for the game."),
    // NFL Detail ID (very little use)
    nfl_detail_id: nullishStringSub(z.uuid()).describe("NFL Detail ID for the game."),
    // Pro football reference ID
    pfr: z.coerce.string().describe("Pro Football Reference ID for the game."),
    // Pro football focus ID
    pff: nullishIntTx.describe("Pro Football Focus ID for the game."),
    // ESPN ID
    espn: z.coerce.number().int().describe("ESPN ID for the game."),
    // For the numbers (fantasy) ID
    ftn: nullishIntTx.describe("FTN (For The Numbers) ID for the game."),
    // How many days of rest the away team got
    away_rest: z.coerce
      .number()
      .int()
      .describe("Number of days of rest the away team had prior to the game."),
    // How many days of rest the home team got
    home_rest: z.coerce
      .number()
      .int()
      .describe("Number of days of rest the home team had prior to the game."),
    away_moneyline: nullishIntTx.describe(
      "The American-odds moneyline price for the away team to win outright. Null = no odds available.",
    ),
    home_moneyline: nullishIntTx.describe(
      "The American-odds moneyline price for the home team to win outright. Null = no odds available.",
    ),
    spread_line: nullishFloatTx.describe(
      "The point spread for the game, in points. Positive = home team favored. Null = no line available.",
    ),
    away_spread_odds: nullishIntTx.describe(
      "The American-odds price (vig/juice) on the away team's spread bet, e.g. -110. Null = no odds available.",
    ),
    home_spread_odds: nullishIntTx.describe(
      "The American-odds price (vig/juice) on the home team's spread bet, e.g. -110. Null = no odds available.",
    ),
    total_line: nullishFloatTx.describe(
      "The over/under total-points line for the game. Null = no line available.",
    ),
    under_odds: nullishIntTx.describe(
      "The American-odds price on the under bet (total points below total_line), e.g. -110. Null = no odds available.",
    ),
    over_oods: nullishIntTx.describe(
      "The American-odds price on the over bet (total points above total_line), e.g. -110. Null = no odds available.",
    ),
    div_game: boolZ1.describe(
      "Whether the game is a divisional game (i.e. both teams are in the same division)",
    ),
    roof: nullishStringSub(z.enum(["outdoors", "dome", "closed", "open"])).describe(
      "The roof type of the stadium for the game. Values: outdoors=open-air, dome=fixed roof, closed=retractable roof closed, open=retractable roof open. Null = unknown.",
    ),
    surface: nullishStringSub(
      z.union([
        z.enum([
          "matrixturf",
          "grass",
          "astroturf",
          "fieldturf",
          "a_turf",
          "sportturf",
          "astroplay",
          "dessograss",
        ]),
        z.string(),
      ]),
    ).describe(
      "The playing surface of the field. Values include grass and artificial turf brands (astroturf, fieldturf, matrixturf, sportturf, astroplay, dessograss, a_turf). Null = unknown.",
    ),
    temp: nullishFloatTx.describe(
      "The temperature of the game, in Fahrenheit. Usually null for indoor games.",
    ),
    wind: nullishFloatTx.describe(
      "The wind speed during the game, in mph. Usually null for indoor games.",
    ),
    away_qb_id: nullishString.describe("The NFL Verse ID for the away team's quarterback"),
    home_qb_id: nullishString.describe("The NFL Verse ID for the home team's quarterback"),
    home_qb_name: nullishString.describe("The name of the home team's quarterback"),
    away_qb_name: nullishString.describe("The name of the away team's quarterback"),
    away_coach: nullishString.describe("The name of the away team's coach"),
    home_coach: nullishString.describe("The name of the home team's coach"),
    referee: nullishString.describe("The head official (referee) of the game"),
    stadium_id: z.coerce.string().describe("The NFL Verse ID of the stadium for the game"),
    stadium: z.coerce.string().describe("The name of the stadium for the game."),
  })
  .describe("A game entry.");

const playerStatsSchemaBase = z.object({
  // Base info
  // If player id = 0 or "", or player name is "", the row is invalid and should be discarded
  player_id: z.coerce
    .string()
    .transform((v, ctx) => {
      if (v === "" || v === "0") {
        ctx.addIssue("Invalid player");
        return z.NEVER;
      }
      return v;
    })
    .describe("The NFL Verse player ID of the player"),
  player_name: z.coerce
    .string()
    .transform((v, ctx) => {
      if (v === "" || v === "0") {
        ctx.addIssue("Invalid player");
        return z.NEVER;
      }
      return v;
    })
    .describe("The player name"),
  player_display_name: z.coerce.string().describe("The full/display name of the player"),
  position: z.pipe(
    z.coerce.string(),
    z.enum([
      "CB",
      "DT",
      "QB",
      "DB",
      "OLB",
      "TE",
      "FB",
      "K",
      "DE",
      "MLB",
      "FS",
      "LB",
      "P",
      "WR",
      "S",
      "OT",
      "G",
      "RB",
      "NT",
      "ILB",
      "C",
      "LS",
    ]),
  ).describe(`The position the player plays. Mapping:
CB=Cornerback
DT=Defensive Tackle
QB=Quarterback
DB=Defensive Back
OLB=Outside Linebacker
TE=Tight End
FB=Fullback
K=Kicker
DE=Defensive End
MLB=Middle linebacker
FS=Free safety
LB=Linebacker
P=Punter
WR=Wide Receiver
S=Safety
OT=Offensive Tackle
G=Guard (Offensive Guard)
RB=Runningback
NT=Nose tackle (Defensive tackle)
ILB=Interior Linebacker
C=Center
LS=Longsnapper`),
  position_group: z.pipe(
    z.coerce.string(),
    z.enum(["DB", "DL", "QB", "LB", "TE", "RB", "SPEC", "WR", "OL"]),
  ).describe(`The position group the player plays in. Mapping:
DB=Defensive backs (Corners, safeties)
DL=Defensive line (DT, DE, NT)
QB=Quarterbacks
LB=Linebackers
TE=Tight ends
RB=Runningbacks, Fullbacks
SPEC=Special teams (K, P)
WR=Receivers
OL=Offensive line`),
  headshot_url: nullishStringSub(z.url()).describe(
    "The URL of the player's headshot image. Null = no headshot available",
  ),
  season: z.coerce.number().int().describe("The season (year) this stat line covers"),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["POST", "REG", "REG+POST"]))
    .describe(`The type of game this stat applies to. Mapping:
POST=Postseason games only
REG=Regular season games only
REG+POST=Regular season and postseason games combined`),

  // Standard stats categories
  completions: z.coerce
    .number()
    .int()
    .describe("The number of completed passes this player threw"),
  attempts: z.coerce.number().int().describe("The number of pass attempts by this player"),
  passing_yards: z.coerce
    .number()
    .describe("The total passing yards gained on this player's passes"),
  passing_tds: z.coerce
    .number()
    .int()
    .describe("The number of passing touchdowns thrown by this player"),
  passing_interceptions: z.coerce
    .number()
    .int()
    .describe("The number of interceptions thrown by this player"),
  sacks_suffered: z.coerce
    .number()
    .int()
    .describe("The number of times this player was sacked (as the passer)"),
  sack_yards_lots: z.coerce
    .number()
    .describe("The number of yards this player lost due to sacks"),
  sack_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of sacks on this player which resulted in fumbles"),
  sack_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of sack-fumbles by this player which were lost to the opposing team"),
  passing_air_yards: z.coerce
    .number()
    .describe("The total air yards on this player's pass attempts (yards the ball traveled in the air before the catch)"),
  passing_yards_after_catch: z.coerce
    .number()
    .describe(
      "The total yards gained after the catch by receivers on this player's completed passes",
    ),
  passing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs achieved on this player's passing plays"),
  passing_epa: z.coerce
    .number()
    .describe("The EPA (expected points added) of this player's passing plays"),
  passing_cpoe: nullishFloatTx.describe(
    "The CPOE (completion percentage over expected) of this player's pass attempts. Null = not available",
  ),
  passing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of successful two-point conversion passes thrown by this player"),
  pacr: z.coerce.number().describe(
    "The passing air conversion ratio (PACR) of this player: passing yards divided by passing air yards. Values above 1.0 mean yards after the catch contributed to the player's passing totals",
  ),
  passing_10: z.coerce
    .number()
    .int()
    .describe("The number of this player's passes resulting in a gain of 10 or more yards"),
  passing_16: z.coerce
    .number()
    .int()
    .describe("The number of this player's passes resulting in an explosive (16+ yards) play"),
  passing_20: z.coerce
    .number()
    .int()
    .describe("The number of this player's passes resulting in a gain of 20 or more yards"),
  passing_40: z.coerce
    .number()
    .int()
    .describe("The number of this player's passes resulting in a gain of 40 or more yards"),
  carries: z.coerce.number().int().describe("The number of rushing attempts by this player"),
  rushing_yards: z.coerce.number().describe("The total rushing yards gained by this player"),
  rushing_tds: z.coerce
    .number()
    .int()
    .describe("The number of rushing touchdowns scored by this player"),
  rushing_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles by this player on rushing plays"),
  rushing_fumbles_lost: z.coerce
    .number()
    .int()
    .describe(
      "The number of fumbles by this player on rushing plays which were lost to the opposing team",
    ),
  rushing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs achieved by this player on rushing plays"),
  rushing_epa: z.coerce.number().describe("The EPA (expected points added) of this player's rushing plays"),
  rushing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of successful two-point conversion rushes by this player"),
  rushing_10: z.coerce
    .number()
    .int()
    .describe("The number of this player's rushes resulting in a gain of 10 or more yards"),
  rushing_12: z.coerce
    .number()
    .int()
    .describe("The number of this player's rushes resulting in an explosive (12+ yards) play"),
  rushing_20: z.coerce
    .number()
    .int()
    .describe("The number of this player's rushes resulting in a gain of 20 or more yards"),
  rushing_40: z.coerce
    .number()
    .int()
    .describe("The number of this player's rushes resulting in a gain of 40 or more yards"),
  receptions: z.coerce.number().int().describe("The number of receptions by this player"),
  targets: z.coerce
    .number()
    .int()
    .describe("The number of times this player was targeted by a pass"),
  receiving_yards: z.coerce
    .number()
    .int()
    .describe("The total receiving yards gained by this player"),
  receiving_tds: z.coerce
    .number()
    .int()
    .describe("The number of receiving touchdowns scored by this player"),
  receiving_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles by this player after a reception"),
  receiving_fumbles_lost: z.coerce
    .number()
    .int()
    .describe(
      "The number of fumbles by this player after a reception which were lost to the opposing team",
    ),
  receiving_air_yards: z.coerce
    .number()
    .describe("The total air yards on targets to this player (yards the ball traveled in the air on the target, regardless of catch)"),
  receiving_yards_after_catch: z.coerce
    .number()
    .describe("The total yards this player gained after the catch"),
  receiving_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs achieved by this player on receptions"),
  receiving_epa: z.coerce
    .number()
    .describe("The EPA (expected points added) of plays targeting this player"),
  receiving_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of successful two-point conversion receptions by this player"),
  receiving_10: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this player gaining 10 or more yards"),
  receiving_16: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this player resulting in an explosive (16+ yards) play"),
  receiving_20: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this player gaining 20 or more yards"),
  receiving_40: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this player gaining 40 or more yards"),
  racr: z.coerce.number().describe(
    "The receiving air conversion ratio (RACR) of this player: receiving yards divided by the player's air yards on targets. Values above 1.0 mean yards after the catch contributed to the player's receiving totals",
  ),
  target_share: z.coerce
    .number()
    .describe("The player's share of the team's total pass targets (fraction, 0-1)"),
  air_yards_share: z.coerce
    .number()
    .describe("The player's share of the team's total intended air yards (fraction, 0-1)"),
  wopr: z.coerce.number().describe(
    "The weighted opportunity rating (WOPR) of this player: a single opportunity metric combining target share and air yards share (1.5 * target_share + 0.7 * air_yards_share)",
  ),
  special_teams_tds: z.coerce
    .number()
    .int()
    .describe(
      "The number of touchdowns scored by this player on special teams (punt/kickoff return tds, blocked fg return tds)",
    ),
  def_tackles_solo: z.coerce
    .number()
    .describe("The number of solo tackles made by this player on defense"),
  def_tackles_with_assist: z.coerce
    .number()
    .describe("The number of combined tackles made by this player on defense (solo plus assisted)"),
  def_tackle_assists: z.coerce
    .number()
    .describe("The number of tackle assists made by this player on defense"),
  def_tackles_for_loss: z.coerce
    .number()
    .describe("The number of tackles for loss made by this player on defense"),
  def_tackles_for_loss_yards: z.coerce
    .number()
    .describe(
      "The total yards the opposing offense lost on this player's tackles for loss",
    ),
  def_fumbles_forced: z.coerce
    .number()
    .int()
    .describe("The number of fumbles forced by this player on defense"),
  def_sacks: z.coerce
    .number()
    .describe("The number of sacks recorded by this player on defense (0.5 for half sacks)"),
  def_sack_yards: z.coerce
    .number()
    .describe("The total yards the opposing offense lost on sacks by this player"),
  def_qb_hits: z.coerce
    .number()
    .describe("The number of quarterback hits recorded by this player on defense"),
  def_interceptions: z.coerce
    .number()
    .describe("The number of interceptions caught by this player on defense"),
  def_interception_yards: z.coerce
    .number()
    .describe("The total yards returned on interceptions by this player"),
  def_pass_defended: z.coerce
    .number()
    .describe("The number of passes defended (broken up) by this player"),
  def_tds: z.coerce
    .number()
    .describe("The number of defensive touchdowns scored by this player (pick-6 or fumble return td)"),
  def_fumbles: z.coerce
    .number()
    .describe("The number of opponent fumbles recovered by this player on defense"),
  def_safeties: z.coerce
    .number()
    .describe("The number of safeties recorded by this player's defense"),
  def_punt_blocks: z.coerce.number().describe("The number of punts blocked by this player"),
  def_pat_blocks: z.coerce
    .number()
    .describe("The number of PAT kicks (1pt kick after touchdown) blocked by this player"),
  def_fg_blocks: z.coerce
    .number()
    .describe("The number of field goal attempts blocked by this player"),
  def_2pt_atts: z.coerce
    .number()
    .describe("The number of 2pt conversion attempts against this player's defense"),
  def_2pt_made: z.coerce
    .number()
    .describe("The number of 2pt conversions the opposing offense succeeded on against this player's defense"),
  misc_yards: z.coerce.number().describe("The number of miscellaneous yards gained by this player"),
  fumble_recovery_own: z.coerce
    .number()
    .describe("The number of this player's own fumbles that were recovered by this player's team"),
  fumble_recovery_yards_own: z.coerce
    .number()
    .describe("The total yards gained on recoveries of this player's own fumbles"),
  fumble_recovery_opp: z.coerce
    .number()
    .describe("The number of opponent fumbles recovered by this player"),
  fumble_recovery_yards_opp: z.coerce
    .number()
    .describe("The total yards gained on recoveries of opponent fumbles by this player"),
  fumble_recovery_tds: z.coerce
    .number()
    .describe("The number of touchdowns scored by this player on fumble recoveries"),
  penalties: z.coerce.number().describe("The number of penalties called on this player"),
  penalty_yards: z.coerce.number().describe("The total yards penalized against this player"),
  timeouts: z.coerce.number().describe("The number of timeouts taken by this player"),
  fumbles_forced_by_opp: z.coerce
    .number()
    .describe("The number of this player's fumbles that were forced by the opposing defense"),
  fumbles_not_forced: z.coerce
    .number()
    .describe("The number of this player's fumbles that were unforced"),
  fumbles_out_of_bounds: z.coerce
    .number()
    .describe("The number of this player's fumbles that went out of bounds"),
  fumbles_total: z.coerce.number().describe("The total count of fumbles by this player"),
  fumbles_lost_total: z.coerce
    .number()
    .describe("The total count of fumbles by this player lost to the opposing team"),
  punt_returns: z.coerce
    .number()
    .describe("The number of times this player returned a punt any distance"),
  punt_return_yards: z.coerce
    .number()
    .describe("The total yards gained by this player on punt returns"),
  kickoff_returns: z.coerce
    .number()
    .describe("The number of times this player returned a kickoff any distance"),
  kickoff_return_yards: z.coerce
    .number()
    .describe("The total yards gained by this player on kickoff returns"),
  fg_made: z.coerce.number().describe("The number of field goals made by this player"),
  fg_att: z.coerce.number().describe("The number of field goals attempted by this player"),
  fg_missed: z.coerce.number().describe("The number of field goals missed by this player"),
  fg_blocked: z.coerce
    .number()
    .describe("The number of this player's field goal attempts which were blocked"),
  fg_long: nullishFloatTx.describe(
    "The longest field goal made by this player (in yards). Null = no field goals made",
  ),
  fg_pct: nullishFloatTx.describe(
    "The field goal make percentage of this player (fraction, 0-1). Null = no field goal attempts",
  ),
  fg_made_0_19: z.coerce
    .number()
    .describe("The number of field goals made by this player from 0 to 19 yards"),
  fg_made_20_29: z.coerce
    .number()
    .describe("The number of field goals made by this player from 20 to 29 yards"),
  fg_made_30_39: z.coerce
    .number()
    .describe("The number of field goals made by this player from 30 to 39 yards"),
  fg_made_40_49: z.coerce
    .number()
    .describe("The number of field goals made by this player from 40 to 49 yards"),
  fg_made_50_59: z.coerce
    .number()
    .describe("The number of field goals made by this player from 50 to 59 yards"),
  fg_made_60_: z.coerce
    .number()
    .describe("The number of field goals made by this player from 60 or more yards"),
  fg_missed_0_19: z.coerce
    .number()
    .describe("The number of field goals missed by this player from 0 to 19 yards"),
  fg_missed_20_29: z.coerce
    .number()
    .describe("The number of field goals missed by this player from 20 to 29 yards"),
  fg_missed_30_39: z.coerce
    .number()
    .describe("The number of field goals missed by this player from 30 to 39 yards"),
  fg_missed_40_49: z.coerce
    .number()
    .describe("The number of field goals missed by this player from 40 to 49 yards"),
  fg_missed_50_59: z.coerce
    .number()
    .describe("The number of field goals missed by this player from 50 to 59 yards"),
  fg_missed_60_: z.coerce
    .number()
    .describe("The number of field goals missed by this player from 60 or more yards"),
  fg_made_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of field goals made by this player, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_missed_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of field goals missed by this player, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_blocked_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of this player's field goal attempts that were blocked, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_made_distance: z.coerce
    .number()
    .describe("The total yardage covered by field goals made by this player"),
  fg_missed_distance: z.coerce
    .number()
    .describe("The total yardage covered by field goals missed by this player"),
  fg_blocked_distance: z.coerce
    .number()
    .describe("The total yardage of this player's field goals which were blocked"),
  pat_made: z.coerce.number().describe("The number of extra point (PAT) kicks made by this player"),
  pat_att: z.coerce
    .number()
    .describe("The number of extra point (PAT) kicks attempted by this player"),
  pat_missed: z.coerce
    .number()
    .describe("The number of extra point (PAT) kicks missed by this player"),
  pat_blocked: z.coerce
    .number()
    .describe("The number of extra point (PAT) kicks by this player that were blocked"),
  pat_pct: nullishFloatTx.describe(
    "The extra point (PAT) make percentage of this player (fraction, 0-1). Null = no PAT attempts",
  ),
  gwfg_made: z.coerce
    .number()
    .describe("The number of game winning field goals made by this player"),
  gwfg_att: z.coerce
    .number()
    .describe("The number of game winning field goals attempted by this player"),
  gwfg_missed: z.coerce
    .number()
    .describe("The number of game winning field goals missed by this player"),
  gwfg_blocked: z.coerce
    .number()
    .describe("The number of game winning field goals by this player that were blocked"),
  gwfg_distance_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of game winning field goal attempts by this player, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  pt_att: z.coerce.number().describe("The number of punts attempted by this player"),
  pt_blocked: z.coerce
    .number()
    .describe("The number of attempted punts by this player that were blocked"),
  pt_long: z.coerce.number().describe("The longest punt by this player (in yards)"),
  pt_yards: z.coerce.number().describe("The total (gross) yardage of this player's punts"),
  pt_inside_20: z.coerce
    .number()
    .describe("The number of this player's punts which ended up inside the opponent's 20 yard line"),
  pt_out_of_bounds: z.coerce
    .number()
    .describe("The number of this player's punts which ended up out of bounds"),
  pt_downed: z.coerce
    .number()
    .describe("The number of this player's punts that the punting team downed"),
  pt_touchback: z.coerce
    .number()
    .describe("The number of this player's punts which resulted in a touchback"),
  pt_fair_caught: z.coerce
    .number()
    .describe("The number of this player's punts where the returner fair-caught the ball"),
  pt_returned: z.coerce
    .number()
    .describe("The number of this player's punts where the returner returned the ball any distance"),
  pt_return_yards: z.coerce
    .number()
    .describe("The total yards conceded to punt returns on this player's punts"),
  pt_return_tds: z.coerce
    .number()
    .describe("The number of punt return touchdowns conceded on this player's punts"),
  pt_net_yards: z.coerce
    .number()
    .describe("The net punt yardage by this player (gross punt yards - return yards)"),
  fantasy_points: z.coerce.number().describe("The fantasy points scored by this player"),
  fantasy_points_ppr: z.coerce
    .number()
    .describe("The fantasy points scored by this player under PPR (points per reception) scoring"),
});

const playerStatsSchemaSeason = playerStatsSchemaBase.extend({
  games: z.coerce.number().int().describe("The number of games this player played in this season"),
  recent_team: z.coerce
    .string()
    .describe("The abbreviation of the team this player most recently played for"),
});

const playerStatsSchemaWeek = playerStatsSchemaBase.extend({
  week: z.coerce.number().describe("The week of the season in which this game happened"),
  team: z.coerce
    .string()
    .describe("The abbreviation of the team this player played for in this game"),
  game_id: z.coerce.string().describe(
    "The NFL Verse game identifier of the game this stat line is for (e.g., 2023_01_KC_DET)",
  ),
  opponent: z.coerce
    .string()
    .describe("The abbreviation of the team this player faced in this game"),
});

const teamStatsSchemaBase = z.object({
  // Base info
  season: z.coerce.number().int().describe("The season (year) this stat line covers"),
  team: z.coerce.string().describe("The abbreviation of the team this stat line is for"),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["POST", "REG", "REG+POST"]))
    .describe(`The type of game this stat applies to. Mapping:
POST=Postseason games only
REG=Regular season games only
REG+POST=Regular season and postseason games combined`),

  // Standard stats categories
  completions: z.coerce
    .number()
    .int()
    .describe("The number of completed passes thrown by this team"),
  attempts: z.coerce.number().int().describe("The number of pass attempts by this team"),
  passing_yards: z.coerce
    .number()
    .describe("The total passing yards gained by this team on offense"),
  passing_tds: z.coerce
    .number()
    .int()
    .describe("The number of passing touchdowns scored by this team"),
  passing_interceptions: z.coerce
    .number()
    .int()
    .describe("The number of interceptions thrown by this team while on offense"),
  sacks_suffered: z.coerce
    .number()
    .int()
    .describe("The number of times this team's quarterback was sacked"),
  sack_yards_lots: z.coerce
    .number()
    .describe("The number of yards this team lost due to sacks"),
  sack_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of sacks on this team which resulted in fumbles"),
  sack_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of sack-fumbles by this team which were lost to the other team"),
  passing_air_yards: z.coerce
    .number()
    .describe("The total air yards on this team's pass attempts (yards the ball traveled in the air before the catch)"),
  passing_yards_after_catch: z.coerce
    .number()
    .describe(
      "The total yards gained after the catch on this team's completed passes",
    ),
  passing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs this team achieved using passes"),
  passing_epa: z.coerce
    .number()
    .describe("The EPA (expected points added) of this team's passing offense"),
  passing_cpoe: nullishFloatTx.describe(
    "The CPOE (completion percentage over expected) of this team's pass attempts. Null = not available",
  ),
  passing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of two-point conversions made by this team using passes"),
  passing_10: z.coerce
    .number()
    .int()
    .describe("The number of this team's passes resulting in a gain of 10 or more yards"),
  passing_16: z.coerce
    .number()
    .int()
    .describe("The number of this team's passes resulting in an explosive (16+ yards) play"),
  passing_20: z.coerce
    .number()
    .int()
    .describe("The number of this team's passes resulting in a gain of 20 or more yards"),
  passing_40: z.coerce
    .number()
    .int()
    .describe("The number of this team's passes resulting in a gain of 40 or more yards"),
  carries: z.coerce.number().int().describe("The number of rushing attempts by this team"),
  rushing_yards: z.coerce.number().describe("The total rushing yards gained by this team"),
  rushing_tds: z.coerce
    .number()
    .int()
    .describe("The number of rushing touchdowns scored by this team"),
  rushing_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles by this team on rushing plays"),
  rushing_fumbles_lost: z.coerce
    .number()
    .int()
    .describe(
      "The number of fumbles by this team on rushing plays which resulted in a turnover",
    ),
  rushing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs gained by this team via rushing"),
  rushing_epa: z.coerce
    .number()
    .describe("The EPA (expected points added) of this team's rushing offense"),
  rushing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of two-point conversions made by this team using rushes"),
  rushing_10: z.coerce
    .number()
    .int()
    .describe("The number of this team's rushes resulting in a gain of 10 or more yards"),
  rushing_12: z.coerce
    .number()
    .int()
    .describe("The number of this team's rushes resulting in an explosive (12+ yards) play"),
  rushing_20: z.coerce
    .number()
    .int()
    .describe("The number of this team's rushes resulting in a gain of 20 or more yards"),
  rushing_40: z.coerce
    .number()
    .int()
    .describe("The number of this team's rushes resulting in a gain of 40 or more yards"),
  receptions: z.coerce
    .number()
    .int()
    .describe("The number of receptions made by this team's receivers"),
  targets: z.coerce
    .number()
    .int()
    .describe("The number of times this team's receivers were targeted by a pass"),
  receiving_yards: z.coerce
    .number()
    .int()
    .describe("The total receiving yards gained by this team"),
  receiving_tds: z.coerce
    .number()
    .int()
    .describe("The number of receiving touchdowns scored by this team"),
  receiving_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles by this team after a reception"),
  receiving_fumbles_lost: z.coerce
    .number()
    .int()
    .describe(
      "The number of fumbles by this team after a reception which resulted in a turnover",
    ),
  receiving_air_yards: z.coerce
    .number()
    .describe("The total air yards on targets to this team's receivers (yards the ball traveled in the air on the target, regardless of catch)"),
  receiving_yards_after_catch: z.coerce
    .number()
    .describe("The total yards this team's receivers gained after the catch"),
  receiving_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs gained by this team via receiving"),
  receiving_epa: z.coerce
    .number()
    .describe("The EPA (expected points added) of plays targeting this team's receivers"),
  receiving_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of two-point conversions made by this team via receptions"),
  receiving_10: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this team gaining 10 or more yards"),
  receiving_16: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this team resulting in an explosive (16+ yards) play"),
  receiving_20: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this team gaining 20 or more yards"),
  receiving_40: z.coerce
    .number()
    .int()
    .describe("The number of receptions by this team gaining 40 or more yards"),
  special_teams_tds: z.coerce
    .number()
    .int()
    .describe(
      "The number of touchdowns scored by this team on special teams (punt/kickoff return tds, blocked fg return tds)",
    ),
  def_tackles_solo: z.coerce
    .number()
    .describe("The number of solo tackles made by this team's defense"),
  def_tackles_with_assist: z.coerce
    .number()
    .describe("The number of combined tackles made by this team's defense (solo plus assisted)"),
  def_tackle_assists: z.coerce
    .number()
    .describe("The number of tackle assists made by this team's defense"),
  def_tackles_for_loss: z.coerce
    .number()
    .describe("The number of tackles for loss made by this team's defense"),
  def_tackles_for_loss_yards: z.coerce
    .number()
    .describe(
      "The total yards the opposing offense lost on tackles for loss by this team's defense",
    ),
  def_fumbles_forced: z.coerce
    .number()
    .int()
    .describe("The number of fumbles forced by this team's defense"),
  def_sacks: z.coerce
    .number()
    .describe("The number of sacks recorded by this team's defense (0.5 for half sacks)"),
  def_sack_yards: z.coerce
    .number()
    .describe("The total yards the opposing offense lost on sacks by this team's defense"),
  def_qb_hits: z.coerce
    .number()
    .describe("The number of quarterback hits recorded by this team's defense"),
  def_interceptions: z.coerce
    .number()
    .describe("The number of interceptions caught by this team's defense"),
  def_interception_yards: z.coerce
    .number()
    .describe("The total yards returned on interceptions by this team's defense"),
  def_pass_defended: z.coerce
    .number()
    .describe("The number of passes defended (broken up) by this team's defense"),
  def_tds: z.coerce
    .number()
    .describe("The number of defensive touchdowns scored by this team (pick-6 or fumble return td)"),
  def_fumbles: z.coerce
    .number()
    .describe("The number of opponent fumbles recovered by this team's defense"),
  def_safeties: z.coerce
    .number()
    .describe("The number of safeties forced by this team's defense"),
  def_punt_blocks: z.coerce.number().describe("The number of punts blocked by this team"),
  def_pat_blocks: z.coerce
    .number()
    .describe("The number of PAT kicks (1pt kick after touchdown) blocked by this team"),
  def_fg_blocks: z.coerce
    .number()
    .describe("The number of field goal attempts blocked by this team"),
  def_2pt_atts: z.coerce
    .number()
    .describe("The number of 2pt conversion attempts made against this team's defense"),
  def_2pt_made: z.coerce
    .number()
    .describe("The number of 2pt conversions the opposing offense succeeded on against this team's defense"),
  misc_yards: z.coerce.number().describe("The number of miscellaneous yards gained by this team"),
  fumble_recovery_own: z.coerce
    .number()
    .describe("The number of this team's own fumbles that this team recovered"),
  fumble_recovery_yards_own: z.coerce
    .number()
    .describe("The total yards gained on recoveries of this team's own fumbles"),
  fumble_recovery_opp: z.coerce
    .number()
    .describe("The number of opponent fumbles recovered by this team"),
  fumble_recovery_yards_opp: z.coerce
    .number()
    .describe("The total yards gained on recoveries of opponent fumbles by this team"),
  fumble_recovery_tds: z.coerce
    .number()
    .describe("The number of touchdowns scored by this team on fumble recoveries"),
  penalties: z.coerce.number().describe("The number of penalties incurred by this team"),
  penalty_yards: z.coerce.number().describe("The total yards lost by this team due to penalties"),
  timeouts: z.coerce.number().describe("The number of timeouts taken by this team"),
  fumbles_forced_by_opp: z.coerce
    .number()
    .describe("The number of this team's fumbles that were forced by the opposing defense"),
  fumbles_not_forced: z.coerce
    .number()
    .describe("The number of this team's fumbles that were unforced"),
  fumbles_out_of_bounds: z.coerce
    .number()
    .describe("The number of this team's fumbles that went out of bounds"),
  fumbles_total: z.coerce.number().describe("The total count of fumbles by this team"),
  fumbles_lost_total: z.coerce
    .number()
    .describe("The total count of fumbles by this team lost to the opposing team"),
  punt_returns: z.coerce
    .number()
    .describe("The number of times this team returned a punt any distance"),
  punt_return_yards: z.coerce
    .number()
    .describe("The total yards gained by this team on punt returns"),
  kickoff_returns: z.coerce
    .number()
    .describe("The number of times this team returned a kickoff any distance"),
  kickoff_return_yards: z.coerce
    .number()
    .describe("The total yards gained by this team on kickoff returns"),
  fg_made: z.coerce.number().describe("The number of field goals made by this team"),
  fg_att: z.coerce.number().describe("The number of field goals attempted by this team"),
  fg_missed: z.coerce.number().describe("The number of field goals missed by this team"),
  fg_blocked: z.coerce
    .number()
    .describe("The number of this team's field goal attempts which were blocked"),
  fg_long: nullishFloatTx.describe(
    "The longest field goal made by this team (in yards). Null = no field goals made",
  ),
  fg_pct: nullishFloatTx.describe(
    "The field goal make percentage of this team (fraction, 0-1). Null = no field goal attempts",
  ),
  fg_made_0_19: z.coerce
    .number()
    .describe("The number of field goals made by this team from 0 to 19 yards"),
  fg_made_20_29: z.coerce
    .number()
    .describe("The number of field goals made by this team from 20 to 29 yards"),
  fg_made_30_39: z.coerce
    .number()
    .describe("The number of field goals made by this team from 30 to 39 yards"),
  fg_made_40_49: z.coerce
    .number()
    .describe("The number of field goals made by this team from 40 to 49 yards"),
  fg_made_50_59: z.coerce
    .number()
    .describe("The number of field goals made by this team from 50 to 59 yards"),
  fg_made_60_: z.coerce
    .number()
    .describe("The number of field goals made by this team from 60 or more yards"),
  fg_missed_0_19: z.coerce
    .number()
    .describe("The number of field goals missed by this team from 0 to 19 yards"),
  fg_missed_20_29: z.coerce
    .number()
    .describe("The number of field goals missed by this team from 20 to 29 yards"),
  fg_missed_30_39: z.coerce
    .number()
    .describe("The number of field goals missed by this team from 30 to 39 yards"),
  fg_missed_40_49: z.coerce
    .number()
    .describe("The number of field goals missed by this team from 40 to 49 yards"),
  fg_missed_50_59: z.coerce
    .number()
    .describe("The number of field goals missed by this team from 50 to 59 yards"),
  fg_missed_60_: z.coerce
    .number()
    .describe("The number of field goals missed by this team from 60 or more yards"),
  fg_made_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of field goals made by this team, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_missed_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of field goals missed by this team, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_blocked_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of this team's field goal attempts that were blocked, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_made_distance: z.coerce
    .number()
    .describe("The total yardage covered by field goals made by this team"),
  fg_missed_distance: z.coerce
    .number()
    .describe("The total yardage covered by field goals missed by this team"),
  fg_blocked_distance: z.coerce
    .number()
    .describe("The total yardage of this team's field goals which were blocked"),
  pat_made: z.coerce.number().describe("The number of extra point (PAT) kicks made by this team"),
  pat_att: z.coerce
    .number()
    .describe("The number of extra point (PAT) kicks attempted by this team"),
  pat_missed: z.coerce
    .number()
    .describe("The number of extra point (PAT) kicks missed by this team"),
  pat_blocked: z.coerce
    .number()
    .describe("The number of extra point (PAT) kicks by this team that were blocked"),
  pat_pct: nullishFloatTx.describe(
    "The extra point (PAT) make percentage of this team (fraction, 0-1). Null = no PAT attempts",
  ),
  gwfg_made: z.coerce
    .number()
    .describe("The number of game winning field goals made by this team"),
  gwfg_att: z.coerce
    .number()
    .describe("The number of game winning field goals attempted by this team"),
  gwfg_missed: z.coerce
    .number()
    .describe("The number of game winning field goals missed by this team"),
  gwfg_blocked: z.coerce
    .number()
    .describe("The number of game winning field goals by this team that were blocked"),
  gwfg_distance_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of game winning field goal attempts by this team, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  pt_att: z.coerce.number().describe("The number of punts attempted by this team"),
  pt_blocked: z.coerce
    .number()
    .describe("The number of attempted punts by this team that were blocked"),
  pt_long: z.coerce.number().describe("The longest punt by this team (in yards)"),
  pt_yards: z.coerce.number().describe("The total (gross) yardage of this team's punts"),
  pt_inside_20: z.coerce
    .number()
    .describe("The number of this team's punts which ended up inside the opponent's 20 yard line"),
  pt_out_of_bounds: z.coerce
    .number()
    .describe("The number of this team's punts which ended up out of bounds"),
  pt_downed: z.coerce
    .number()
    .describe("The number of this team's punts that the punting team downed"),
  pt_touchback: z.coerce
    .number()
    .describe("The number of this team's punts which resulted in a touchback"),
  pt_fair_caught: z.coerce
    .number()
    .describe("The number of this team's punts where the returner fair-caught the ball"),
  pt_returned: z.coerce
    .number()
    .describe("The number of this team's punts where the returner returned the ball any distance"),
  pt_return_yards: z.coerce
    .number()
    .describe("The total yards conceded to punt returns on this team's punts"),
  pt_return_tds: z.coerce
    .number()
    .describe("The number of punt return touchdowns conceded on this team's punts"),
  pt_net_yards: z.coerce
    .number()
    .describe("The net punt yardage by this team (gross punt yards - return yards)"),
});

const teamStatsSchemaSeason = teamStatsSchemaBase.extend({
  games: z.coerce.number().int().describe("The number of games this team played this season"),
});

const teamStatsSchemaWeek = teamStatsSchemaBase.extend({
  week: z.coerce.number().describe("The week of the season in which this game happened"),
  game_id: z.coerce.string().describe(
    "The NFL Verse game identifier of the game this stat line is for (e.g., 2023_01_KC_DET)",
  ),
  opponent: z.coerce
    .string()
    .describe("The abbreviation of the team this team faced in this game"),
});

const ftnChartingSchema = z.object({
  ftn_game_id: z.coerce.number().int().describe("The FTN ID of the game"),
  nflverse_game_id: z.coerce.string().describe("The NFL Verse game ID"),
  season: z.coerce.number().describe("The season (year) of the game"),
  week: z.coerce.number().describe("The week in the season of the game"),
  ftn_play_id: z.coerce.string().describe("The FTN ID of the play"),
  nflverse_play_id: z.coerce.string().describe("The NFL Verse ID of the play"),
  starting_hash: nullishStringSub(z.enum(["R", "L", "M"]))
    .describe(`The section of the field the ball started at. Mapping:
L=Left hash
R=Right hash
M=Middle (center)`),
  qb_location: nullishStringSub(z.enum(["U", "S", "P"]))
    .describe(`The starting position of the quarterback. Mapping:
U=Under center
S=Shotgun
P=Pistol`),
  n_offense_backfield: nullishIntTx.describe("The number of offensive players in the backfield"),
  n_defense_box: nullishIntTx.describe("The number of defenders in the box"),
  is_no_huddle: boolZ1.describe("Whether the play started without a huddle"),
  is_motion: boolZ1.describe("Whether the play had motion"),
  is_play_action: boolZ1.describe("Whether the play was a play-action pass (Fake rush)"),
  is_screen_pass: boolZ1.describe("Whether the play is a screen pass"),
  is_rpo: boolZ1.describe("Whether the play is a Run-Pass Option"),
  is_trick_play: boolZ1.describe("Whether the play is a trick play (e.g. fake punt)"),
  is_qb_out_of_pocket: boolZ1.describe("Whether the QB left the pocket during the play"),
  is_interception_worthy: boolZ1.describe("Whether the throw was interception worthy"),
  is_throw_away: boolZ1.describe("Whether the throw was intended to not go to anyone"),
  read_thrown: nullishStringSub(z.enum(["CHK", "1", "2", "3", "4", "SD", "DES"])).describe(
    `Which read was thrown to, if any. Mapping:
CHK=Checkdown
1-4=The numbered read in the progression
SD=Scramble drill
DES=Designed read`,
  ),
  is_catchable_ball: boolZ1.describe("Whether the ball can be caught by the receiver or not"),
  is_contested_ball: boolZ1.describe("Whether the ball was contested by a defender"),
  is_created_reception: boolZ1.describe(
    "Whether the receiver created the reception beyond what the throw gave him (e.g. had to adjust, contort, or make a difficult play to secure the catch)",
  ),
  is_drop: boolZ1.describe("Whether the ball was dropped by the receiver"),
  is_qb_sneak: boolZ1.describe(
    "Whether this is a short rush play where the QB rushes the ball to gain a first down",
  ),
  n_blitzers: nullishIntTx.describe("The number of blitzers (additional rushers) on the play"),
  n_pash_rushers: nullishIntTx.describe("The number of pass rushers (total) on the play"),
  is_qb_fault_sack: boolZ1.describe("Whether the QB is at fault for taking the sack or not"),
  date_pulled: z.pipe(z.coerce.string(), z.iso.datetime()).describe("When this data was fetched"),
});

const espnQbrSeasonalSchema = z.object({
  season: z.coerce.number().describe("The season (year) for this qb's rating"),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["Regular", "Playoffs"]))
    .describe("The type of 'season' for this stat."),
  game_week: z
    .transform((v, ctx) => {
      if (typeof v === "number") {
        if (Number.isSafeInteger(v)) {
          return v;
        }
        ctx.addIssue("Invalid week number");
        return z.NEVER;
      }
      const vx = String(v).trim();
      if (vx === "Season Total") {
        return "Season Total" as const;
      }
      const vn = Number.parseInt(vx);
      if (Number.isNaN(vn) || !Number.isSafeInteger(vn)) {
        ctx.addIssue("Invalid week number");
        return z.NEVER;
      }
      return vn;
    })
    .describe("The week of the game"),
  team_abb: z.coerce.string().describe("The team (Abbreviation) this player played for"),
  player_id: z.coerce.string().describe("The (NFL Verse or ESPN, idk) Player ID"),
  name_short: z.coerce.string().describe("The shortened player name"),
  rank: z.coerce.number().describe("The player's rank, relative to the other qbs"),
  qbr_total: z.coerce.number().describe("The player's total QBR"),
  pts_added: z.coerce.number().describe("The number of points this qb contributed"),
  qb_plays: z.coerce.number().describe("The number of plays this QB ran"),
  epa_total: z.coerce.number().describe("The effective points added by this player"),
  pass: z.coerce.number().describe("The player's passing QBR"),
  run: z.coerce.number().describe("The player's rushing QBR"),
  exp_sack: z.coerce.number().describe(
    "The expected sacks component of the QBR formula (sacks the QB was expected to take based on the play context)",
  ),
  penalty: z.coerce.number().describe("The penalty component of the QBR formula (penalty EPA attributed to the QB)"),
  qbr_raw: z.coerce.number().describe("The raw QBR for this player"),
  sack: z.coerce.number().describe("The sack component of the QBR formula (EPA lost on sacks, split between QB fault and OL/other fault)"),
  name_first: z.coerce.string().describe("The player's first name"),
  name_last: z.coerce.string().describe("The player's last name"),
  name_display: z.coerce.string().describe("The player's display name"),
  headshot_ref: nullishStringSub(z.url()).describe("The player's headshot image URI"),
  team: z.coerce.string().describe("The team (nickname) this player played for"),
  qualified: boolZ1.describe(
    "Whether the QB met the minimum-play threshold to have a qualified (official) QBR ranking",
  ),
});

const espnQbrWeeklySchema = espnQbrSeasonalSchema.extend({
  // Different:
  game_id: z.coerce.string().describe("The ESPN game ID"),
  week_text: z.coerce.string().describe("The text description of the game week (e.g. 'Week 1' or 'Wild Card')"),
  opp_id: z.coerce.string().describe("The ESPN team ID of the opponent"),
  opp_abb: z.coerce.string().describe("The abbreviation of the opposing team"),
  opp_team: z.coerce.string().describe("The full team name (city + nickname) of the opponent"),
  opp_name: z.coerce.string().describe("The nickname of the opposing team"),
  week_num: z.coerce.number().describe("The week number of the game"),
});

const rosterWeeklySchema = z.object({
  season: z.coerce.number().describe("The season (year) for the roster entry"),
  team: z.coerce.string().describe("The team (Abbreviation) for this roster entry"),
  position: nullishStringSub(
    z.enum([
      "RB",
      "CB",
      "G",
      "T",
      "DT",
      "DE",
      "K",
      "SS",
      "C",
      "FS",
      "WR",
      "TE",
      "FB",
      "OLB",
      "QB",
      "P",
      "MLB",
      "NT",
      "ILB",
      "LB",
      "DB",
      "S",
      "LS",
      "KR",
      "PR",
      "DL",
      "OL",
    ]),
  ).describe("The position the player plays on this roster."),
  depth_chart_position: nullishStringSub(
    z.enum([
      "K",
      "LS",
      "QB",
      "P",
      "WR",
      "OLB",
      "DE",
      "TE",
      "DT",
      "CB",
      "SS",
      "T",
      "NT",
      "LB",
      "FS",
      "FB",
      "RB",
      "DB",
      "S",
      "ILB",
      "G",
      "OG",
      "C",
      "MLB",
      "OT",
      "OL",
      "SAF",
      "DL",
      "PR",
      "HB",
    ]),
  ).describe("The depth chart listed position of this player"),
  jersey_number: z.coerce.string().describe("The jersey number this player wears"),
  status: z
    .pipe(
      z.coerce.string(),
      z.enum([
        "ACT",
        "RES",
        "TRC",
        "CUT",
        "TRD",
        "SUS",
        "TRT",
        "NWT",
        "",
        "RSN",
        "DEV",
        "EXE",
        "RSR",
        "PUP",
        "UDF",
        "INA",
        "UFA",
        "RFA",
        "RET",
        "E01",
        "E14",
      ]),
    )
    .describe(
      `The status of the player on the roster. Mapping:
ACT=On the active roster
RES=On the reserve list (e.g. injured reserve)
TRC=Released from the practice squad
CUT=Cut from the team's roster
TRD=Traded to another team
SUS=Suspended by the league
TRT=Released from the practice squad
NWT=Not with team (tends to indicate a waived player)
""=Unknown/empty
RSN=On the non-football injured reserve list
DEV=On the practice squad (development)
EXE=On the commissioner's exempt list
RSR=Released from the injured reserve list
PUP=On the Physically Unable to Perform list
UDF=Undrafted free agent
INA=Inactive (under contract but not on the active roster)
UFA=Unrestricted free agent
RFA=Restricted free agent
RET=Retired
E01=Exempt/reserve designation (E-prefixed league status code)
E14=On the roster as an exempt international player (International Player Pathway)`,
    ),
  full_name: z.coerce.string().describe("The player's full name"),
  first_name: z.coerce.string().describe("The player's first name"),
  last_name: z.coerce.string().describe("The player's last name"),
  birth_date: z.pipe(z.coerce.string(), z.iso.date()).describe("The player's birth date"),
  height: z.coerce.number().describe("The player's height in inches"),
  weight: z.coerce.number().describe("The player's weight in lbs"),
  college: z.coerce.string().describe("The college the player went to"),
  gsis_id: z.coerce.string().describe(
    "The player's GSIS (Game Statistics and Information System) ID, the NFL's internal player identifier",
  ),
  espn_id: nullishString.describe("The player's ESPN ID"),
  sportradar_id: nullishString.describe("The player's SportRadar ID"),
  yahoo_id: nullishString.describe("The player's Yahoo Sports ID"),
  rotowire_id: nullishString.describe("The player's Rotowire ID"),
  pff_id: nullishString.describe("The player's Pro Football Focus ID"),
  pfr_id: nullishString.describe("The player's Pro Football Reference ID"),
  fantasy_data_id: nullishString.describe("The player's Fantasy Data ID"),
  sleeper_id: nullishString.describe("The player's Sleeper ID"),
  years_exp: nullishIntTx.describe("The number of years the player has been in the league"),
  headshotUrl: nullishStringSub(z.url()).describe("The player's headshot image URL"),
  ngs_position: nullishStringSub(
    z.enum([
      "QB",
      "WR",
      "SLOT_WR",
      "EDGE",
      "INTERIOR_LINE",
      "TE",
      "CB",
      "SLOT_CB",
      "SAFETY",
      "T",
      "MLB",
      "FB",
      "RB",
      "G",
      "C",
      "OLB",
      "EXTRA_OL",
    ]),
  ).describe("The player's NextGenStats position"),
  week: nullishIntTx.describe("The week this roster entry represents"),
  game_type: nullishStringSub(z.enum(["REG", "DIV", "WC", "CON", "SB"])).describe(
    `The game type for this week's game. Mapping:
REG=Regular season
DIV=Divisional round
WC=Wild Card round
CON=Conference championship
SB=Super Bowl`,
  ),
  status_description_abbr: nullishString.describe("The description (abbr) of this player's status"),
  football_name: nullishString.describe(
    "The name the player goes by for football purposes (their preferred football name)",
  ),
  esb_id: nullishString.describe("The player's ESB ID"),
  gsis_it_id: nullishString.describe(
    "The player's GSIS IT ID (the IT/information-technology system ID used by NFL internal systems, distinct from the standard GSIS player ID)",
  ),
  smart_id: nullishString.describe(
    "The player's SMART ID (the NFL's SMART player ID used for cross-system linking)",
  ),
  entry_year: nullishIntTx.describe("The year the player entered the league"),
  rookie_year: nullishIntTx.describe("The player's rookie year"),
  draft_club: nullishString.describe(
    "The team (Abbreviation) of the club which drafted this player. Null = UDFA",
  ),
  draft_number: nullishIntTx.describe("The position in the draft that this player was taken at"),
});

const playerSchema = z.object({
  gsis_id: z.coerce.string().describe(
    "The player's GSIS (Game Statistics and Information System) ID, the NFL's internal player identifier",
  ),
  display_name: z.coerce.string().describe("The player's display name (full name as commonly displayed)"),
  common_first_name: z.coerce.string().describe("The player's commonly used first name"),
  first_name: z.coerce.string().describe("The player's first name"),
  last_name: z.coerce.string().describe("The player's last name"),
  short_name: nullishString.describe("The player's short name"),
  football_name: nullishString.describe("The name the player goes by for football purposes (their preferred football name)"),
  suffix: nullishString.describe("The player's name suffix (e.g. Jr., II, III)"),
  esb_id: nullishString.describe("The player's ESB ID"),
  nfl_id: nullishString.describe("The player's NFL.com ID"),
  pfr_id: nullishString.describe("The player's Pro Football Reference ID"),
  pff_id: nullishString.describe("The player's Pro Football Focus ID"),
  otc_id: nullishString.describe("The player's Over the Cap ID"), // otc=over the cap
  espn_id: nullishString.describe("The player's ESPN ID"),
  smart_id: nullishString.describe(
    "The player's SMART ID (the NFL's SMART player ID used for cross-system linking)",
  ),
  birth_date: z
    .pipe(z.coerce.string(), z.iso.date())
    .describe("The player's birth date (ISO 8601 date)"),
  position_group: z
    .pipe(
      z.coerce.string(),
      z.enum(["DL", "RB", "LB", "SPEC", "WR", "DB", "TE", "OL", "QB"]),
    )
    .describe(
      `The player's position group. Mapping:
DL=Defensive Line
RB=Running Back
LB=Linebacker
SPEC=Special Teams
WR=Wide Receiver
DB=Defensive Back
TE=Tight End
OL=Offensive Line
QB=Quarterback`,
    ),
  position: z
    .pipe(
      z.coerce.string(),
      z.enum([
        "NT",
        "RB",
        "LB",
        "K",
        "WR",
        "DE",
        "S",
        "DB",
        "FS",
        "OLB",
        "TE",
        "CB",
        "G",
        "OT",
        "DT",
        "C",
        "MLB",
        "QB",
        "SAF",
        "LS",
        "DL",
        "P",
        "ILB",
        "OL",
        "FB",
      ]),
    )
    .describe(
      `The player's primary position. Mapping:
NT=Nose Tackle
RB=Running Back
LB=Linebacker
K=Kicker
WR=Wide Receiver
DE=Defensive End
S=Safety
DB=Defensive Back
FS=Free Safety
OLB=Outside Linebacker
TE=Tight End
CB=Cornerback
G=Guard
OT=Offensive Tackle
DT=Defensive Tackle
C=Center
MLB=Middle Linebacker
QB=Quarterback
SAF=Safety
LS=Long Snapper
DL=Defensive Lineman
P=Punter
ILB=Inside Linebacker
OL=Offensive Lineman
FB=Fullback`,
    ),
  ngs_position_group: nullishStringSub(
    z.enum(["RB", "WR", "DL", "DB", "OL", "TE", "LB", "QB", "SPEC"]),
  ).describe(
    `The player's Next Gen Stats position group. Mapping:
RB=Running Back
WR=Wide Receiver
DL=Defensive Line
DB=Defensive Back
OL=Offensive Line
TE=Tight End
LB=Linebacker
QB=Quarterback
SPEC=Special Teams`,
  ),
  ngs_position: nullishStringSub(
    z.enum([
      "RB",
      "WR",
      "INTERIOR_LINE",
      "EDGE",
      "HIGH_SAFETY",
      "SLOT_CB",
      "CB",
      "SAFETY",
      "G",
      "T",
      "TE",
      "MLB",
      "QB",
      "SLOT_WR",
      "C",
      "FB",
      "OLB",
    ]),
  ).describe(
    `The player's Next Gen Stats position. Mapping:
RB=Running Back
WR=Wide Receiver
INTERIOR_LINE=Interior Defensive Line
EDGE=Edge Rusher
HIGH_SAFETY=High Safety
SLOT_CB=Slot Cornerback
CB=Cornerback
SAFETY=Safety
G=Guard
T=Tackle
TE=Tight End
MLB=Middle Linebacker
QB=Quarterback
SLOT_WR=Slot Wide Receiver
C=Center
FB=Fullback
OLB=Outside Linebacker`,
  ),
  height: nullishIntTx.describe("The player's height in inches"), // inches
  weight: nullishIntTx.describe("The player's weight in lbs"), // lbs
  headshot: nullishStringSub(z.url()).describe("The player's headshot image URL"),
  college_name: nullishString.describe("The name of the college the player attended"),
  college_conference: nullishString.describe("The conference of the college the player attended"),
  jersey_number: nullishString.describe("The jersey number the player wears"),
  rookie_season: z.coerce.number().int().describe("The player's rookie season (year)"),
  last_season: nullishIntTx.describe("The most recent season the player played"),
  latest_team: z.coerce.string().describe("The most recent team (abbreviation) the player played for"),
  status: nullishStringSub(
    z.enum([
      "DEV",
      "ACT",
      "RES",
      "CUT",
      "RSN",
      "NWT",
      "RLS",
      "SUS",
      "RSR",
      "PUP",
      "EXE",
      "RET",
      "INA",
    ]),
  ).describe(
    `The player's roster status. Mapping:
DEV=On the practice squad (development)
ACT=On the active roster
RES=On the reserve list (e.g. injured reserve)
CUT=Cut from the team's roster
RSN=On the non-football injured reserve list
NWT=Not with team (waived)
RLS=Released by the team
SUS=Suspended by the league
RSR=Released from the injured reserve list
PUP=On the Physically Unable to Perform list
EXE=On the commissioner's exempt list
RET=Retired
INA=Inactive (under contract but not on the active roster)`,
  ),
  ngs_status: nullishStringSub(
    z.enum([
      "ACT",
      "CUT",
      "RES",
      "U01",
      "DEV",
      "UFA",
      "PUP",
      "TRD",
      "RET",
      "SUS",
      "RFA",
      "A02",
      "NWT",
      "EXE",
      "INA",
      "RSN",
      "TRC",
      "RSR",
      "TRT",
      "E14",
    ]),
  ).describe(
    `The player's Next Gen Stats roster status code. Mapping:
ACT=Active
CUT=Cut
RES=Reserve
U01=League status code (specific meaning not documented)
DEV=Practice squad (development)
UFA=Unrestricted free agent
PUP=Physically Unable to Perform
TRD=Traded
RET=Retired
SUS=Suspended
RFA=Restricted free agent
A02=League status code (specific meaning not documented)
NWT=Not with team
EXE=Exempt
INA=Inactive
RSN=Reserve/non-football injury
TRC=Released from the practice squad
RSR=Reserve/retired (released from the injured reserve list)
TRT=Released from the practice squad
E14=Exempt international player (International Player Pathway)`,
  ),
  ngs_status_short_description: nullishString.describe(
    "The Next Gen Stats short description of the player's status (e.g. 'Active', 'R/Injured', 'Practice Squad')",
  ),
  years_of_experience: z.coerce.number().int().describe("The player's years of NFL experience"),
  pff_position: nullishStringSub(
    z.enum([
      "DI",
      "HB",
      "WR",
      "S",
      "LB",
      "CB",
      "G",
      "ED",
      "T",
      "TE",
      "LS",
      "FB",
      "K",
      "ST",
      "QB",
      "C",
      "P",
    ]),
  ).describe(
    `The player's Pro Football Focus position. Mapping:
DI=Defensive Interior
HB=Halfback
WR=Wide Receiver
S=Safety
LB=Linebacker
CB=Cornerback
G=Guard
ED=Edge
T=Tackle
TE=Tight End
LS=Long Snapper
FB=Fullback
K=Kicker
ST=Special Teams
QB=Quarterback
C=Center
P=Punter`,
  ),
  pff_status: nullishStringSub(
    z.enum(["A", "P", "IR", "I", "S", "IRD", "RPUP", "PINJ", "DNR", "APUP", "RNFI", "PSUS"]),
  ).describe(
    `The player's Pro Football Focus status code (PFF-specific designations). Mapping:
A=Active
P=Probable
IR=Injured Reserve
I=Injured
S=Suspended
IRD=Injured Reserve (Designated for Return)
RPUP=Reserve/Physically Unable to Perform
PINJ=Physically Injured
DNR=Did Not Report
APUP=Active/Physically Unable to Perform
RNFI=Reserve/Non-Football Injury
PSUS=Suspended (PFF designation)`,
  ),
  draft_year: nullishIntTx.describe("The year the player was drafted (null if undrafted)"),
  draft_round: nullishIntTx.describe("The round in which the player was drafted (null if undrafted)"),
  draft_pick: nullishIntTx.describe(
    "The overall pick number the player was drafted at (null if undrafted)",
  ),
  draft_team: nullishString.describe("The team (abbreviation) that drafted the player (null if undrafted)"),
});

const officialsSchema = z.object({
  game_id: z.coerce.string().describe("The ID of the game this official worked"),
  game_key: z.coerce.string().describe(
    "The game key (nflverse game identifier, e.g. '2023_01_DET_KC') this official worked",
  ),
  official_name: z.coerce.string().describe("The name of the official"),
  position: z.coerce.string().describe(
    "The official's position on the crew (e.g. 'Referee', 'Umpire', 'Field Judge', 'Replay Official', 'Alternate')",
  ),
  jersey_number: z.coerce.string().describe("The jersey number worn by the official"),
  official_id: z.coerce.string().describe("The unique ID of the official"),
  season: z.coerce.number().int().describe("The season (year) of the game"),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB", "POST"]))
    .describe(
      `The type of game. Mapping:
REG=Regular season
WC=Wild Card round
DIV=Divisional round
CON=Conference championship
SB=Super Bowl
POST=Postseason (unspecified round)`,
    ),
  week: z.coerce.number().int().describe("The week of the game"),
});

const draftPicksSchema = z.object({
  season: z.coerce.number().int().describe("Draft season year"),
  round: z.coerce.number().int().describe("Round of the draft in which the player was selected"),
  pick: z.coerce.number().int().describe("Overall pick number in the draft"),
  team: z.coerce.string().describe("Drafting team abbreviation"),
  gsis_id: z.coerce.string().describe("GSIS player identifier"),
  pfr_player_id: z.coerce.string().describe("Pro-Football-Reference player identifier"),
  cfb_player_id: nullishString.describe("College Football Reference player identifier; null when empty"),
  pfr_player_name: nullishString.describe("Player name as listed on Pro-Football-Reference; null when empty"),
  hof: boolZ1.describe("True if the player is in the Pro Football Hall of Fame (0/null/undefined coerce to false; 'TRUE'/'FALSE' strings accepted)"),
  position: z.pipe(
    z.coerce.string(),
    z.enum([
      "RB",
      "WR",
      "T",
      "DE",
      "TE",
      "DB",
      "G",
      "QB",
      "LB",
      "C",
      "NT",
      "P",
      "DT",
      "K",
      "FB",
      "KR",
      "OL",
      "DL",
      "OLB",
      "CB",
      "S",
      "ILB",
      "LS",
      "OT",
      "SAF",
      "FS",
      "OG",
    ]),
  ).describe("Position at time of draft: RB=Running Back, WR=Wide Receiver, T=Tackle, DE=Defensive End, TE=Tight End, DB=Defensive Back, G=Guard, QB=Quarterback, LB=Linebacker, C=Center, NT=Nose Tackle, P=Punter, DT=Defensive Tackle, K=Kicker, FB=Fullback, KR=Kick Returner, OL=Offensive Lineman, DL=Defensive Lineman, OLB=Outside Linebacker, CB=Cornerback, S=Safety, ILB=Inside Linebacker, LS=Long Snapper, OT=Offensive Tackle, SAF=Safety, FS=Free Safety, OG=Offensive Guard"),
  category: z.pipe(
    z.coerce.string(),
    z.enum(["RB", "WR", "OL", "DL", "TE", "DB", "QB", "LB", "P", "K", "KR", "LS", "FS", "OG"]),
  ).describe("Broad position category: RB=Running Back, WR=Wide Receiver, OL=Offensive Line, DL=Defensive Line, TE=Tight End, DB=Defensive Back, QB=Quarterback, LB=Linebacker, P=Punter, K=Kicker, KR=Kick Returner, LS=Long Snapper, FS=Free Safety, OG=Offensive Guard"),
  size: nullishStringSub(z.enum(["O", "D", "S"])).describe("Side of the ball: O=Offense, D=Defense, S=Special Teams; null when empty"),
  college: nullishString.describe("College attended; null when empty"),
  age: z.coerce.number().int().describe("Age at the time of the draft"),
  to: nullishIntTx.describe("Last season year in which the player played; null when empty or unparseable"),
  allpro: z.coerce.number().int().describe("Career first-team All-Pro selections"),
  probowls: z.coerce.number().int().describe("Career Pro Bowl selections"),
  seasons_started: z.coerce.number().int().describe("Number of seasons in which the player was a starter"),
  w_av: nullishIntTx.describe("Pro-Football-Reference weighted career Approximate Value (AV), emphasizing peak seasons; null when empty"),
  car_av: z.coerce.string().describe("Pro-Football-Reference career Approximate Value (AV) as a raw string; appears empty in this feed — prefer w_av or dr_av"),
  dr_av: nullishIntTx.describe("Pro-Football-Reference draft Approximate Value (AV), the AV accrued during the player's rookie contract (draft-relative value); null when empty"),
  games: nullishIntTx.describe("Career games played; null when empty"),
  pass_completions: nullishIntTx.describe("College career pass completions (also present in the full player stats set); null when empty"),
  pass_attempts: nullishIntTx.describe("College career pass attempts; null when empty"),
  pass_yards: nullishIntTx.describe("College career passing yards; null when empty"),
  pass_tds: nullishIntTx.describe("College career passing touchdowns; null when empty"),
  pass_ints: nullishIntTx.describe("College career interceptions thrown; null when empty"),
  rush_atts: nullishIntTx.describe("College career rushing attempts; null when empty"),
  rush_yards: nullishIntTx.describe("College career rushing yards; null when empty"),
  rush_tds: nullishIntTx.describe("College career rushing touchdowns; null when empty"),
  receptions: nullishIntTx.describe("College career receptions; null when empty"),
  rec_yards: nullishIntTx.describe("College career receiving yards; null when empty"),
  rec_tds: nullishIntTx.describe("College career receiving touchdowns; null when empty"),
  def_solo_tackles: nullishIntTx.describe("College career solo tackles; null when empty"),
  def_ints: nullishIntTx.describe("College career interceptions (defense); null when empty"),
  def_sacks: nullishIntTx.describe("College career sacks; null when empty"),
});

const histContractsSchema = z.object({
  player: z.coerce.string().describe("Player full name"),
  position: z.pipe(
    z.coerce.string(),
    z.enum([
      "QB",
      "RB",
      "FB",
      "WR",
      "TE",
      "LT",
      "LG",
      "C",
      "RG",
      "RT",
      "IDL",
      "ED",
      "LB",
      "CB",
      "S",
      "K",
      "P",
      "LS",
    ]),
  ).describe("Player position: QB=Quarterback, RB=Running Back, FB=Fullback, WR=Wide Receiver, TE=Tight End, LT=Left Tackle, LG=Left Guard, C=Center, RG=Right Guard, RT=Right Tackle, IDL=Interior Defensive Line, ED=Edge Rusher, LB=Linebacker, CB=Cornerback, S=Safety, K=Kicker, P=Punter, LS=Long Snapper"),
  team: z.coerce.string().describe("Team nickname, or slash-separated abbreviations when the contract spanned multiple teams (e.g. 'LAR/SEA')"),
  is_active: boolZ1.describe("True if the contract is currently active (0/null/undefined coerce to false)"),
  year_signed: z.coerce.number().int().describe("Calendar year in which the contract was signed"),
  years: z.coerce.string().describe("Contract length as a string: either a number of years or the literal 'NA' when not available"),
  value: z.coerce.number().describe("Total contract value in USD"),
  apy: z.coerce.number().describe("Average per year (APY) contract value in USD"),
  guaranteed: z.coerce.number().describe("Guaranteed money in USD"),
  apy_cap_pct: z.coerce.number().describe("APY as a percentage of the salary cap in effect when the contract was signed (e.g. 15.2 = 15.2%)"),
  inflated_value: z.coerce.number().describe("Total contract value in USD adjusted for salary-cap inflation to current cap dollars"),
  inflated_apy: z.coerce.number().describe("Average per year (APY) value in USD adjusted for salary-cap inflation"),
  inflated_guaranteed: z.coerce.number().describe("Guaranteed money in USD adjusted for salary-cap inflation"),
  player_page: z.pipe(z.coerce.string(), z.url()).describe("OverTheCap player page URL"),
  otc_id: z.coerce.string().describe("OverTheCap player identifier"),
  date_of_birth: z.coerce.string().describe("Informal date of birth string from OverTheCap; ignore in favor of other sources"),
  height: z.coerce.string().describe("Informal height string in ft'in\" format; ignore in favor of other sources"),
  weight: z.coerce.string().describe("Informal weight string in lbs, may be the literal 'NA'; ignore in favor of other sources"),
  college: z.coerce.string().describe("College attended"),
  draft_year: z.coerce.string().describe("Informal draft year string; ignore in favor of other sources"),
  draft_round: z.coerce.string().describe("Informal draft round string; ignore in favor of other sources"),
  draft_overall: z.coerce.string().describe("Informal overall draft pick number string; ignore in favor of other sources"),
  draft_team: z.coerce.string().describe("Informal drafting team string; ignore in favor of other sources"),
  season_history: z.coerce.string().describe("Concise string of the seasons the player played (informal summary from OverTheCap)"),
});

// "game_id":"2026_01_ARI_LAC","pfr_game_id":"202609130sdg","season":2026,"game_type":"REG","week":1,"player":"Cole Strange","pfr_player_id":"StraCo01","position":"G","team":"LAC","opponent":"ARI","offense_snaps":55,"offense_pct":1,"defense_snaps":0,"defense_pct":0,"st_snaps":2,"st_pct":0.08

const snapCountSchema = z.object({
  game_id: z.coerce.string().describe("nflverse game id (e.g. '2026_01_ARI_LAC')"),
  pfr_game_id: z.coerce.string().describe("Pro-Football-Reference game identifier"),
  season: z.coerce.number().describe("Season year"),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"])).describe("Game type: REG=Regular Season, WC=Wild Card, DIV=Divisional Playoff, CON=Conference Championship, SB=Super Bowl"),
  week: z.coerce.number().describe("Week number of the season"),
  player: z.coerce.string().describe("Player full name"),
  pfr_player_id: z.coerce.string().describe("Pro-Football-Reference player identifier"),
  position: z.pipe(
    z.coerce.string(),
    z.enum([
      "G",
      "T",
      "C",
      "QB",
      "TE",
      "WR",
      "RB",
      "FB",
      "FS",
      "SS",
      "LB",
      "CB",
      "NT",
      "DT",
      "DE",
      "K",
      "LS",
      "P",
      "S",
      "DB",
      "OL",
      "DL",
      "HB",
      "RB/W",
      "LB/F",
      "ILB",
      "OLB",
      "OT",
      "C/G",
      "G/T",
      "MLB",
      "G/C",
      "WR/R",
      "FB/D",
      "DB/L",
      "T/G",
      "DT/D",
      "DE/L",
      "CB/R",
      "FB/T",
      "G/OT",
      "K/P",
      "TE/D",
      "DE/D",
      "FB/R",
      "RB/F",
      "OG",
      "LB/S",
    ]),
  ).describe("Player position as listed by Pro-Football-Reference; slash-separated values are combined/hybrid position labels: G=Guard, T=Tackle, C=Center, QB=Quarterback, TE=Tight End, WR=Wide Receiver, RB=Running Back, FB=Fullback, FS=Free Safety, SS=Strong Safety, LB=Linebacker, CB=Cornerback, NT=Nose Tackle, DT=Defensive Tackle, DE=Defensive End, K=Kicker, LS=Long Snapper, P=Punter, S=Safety, DB=Defensive Back, OL=Offensive Lineman, DL=Defensive Lineman, HB=Halfback, ILB=Inside Linebacker, OLB=Outside Linebacker, OT=Offensive Tackle, MLB=Middle Linebacker, OG=Offensive Guard"),
  team: z.coerce.string().describe("Team abbreviation"),
  opponent: z.coerce.string().describe("Opponent team abbreviation"),
  offense_snaps: z.coerce.number().describe("Number of offensive snaps played"),
  offense_pct: z.coerce.number().describe("Fraction (0-1) of the team's offensive snaps played by this player"),
  defense_snaps: z.coerce.number().describe("Number of defensive snaps played"),
  defense_pct: z.coerce.number().describe("Fraction (0-1) of the team's defensive snaps played by this player"),
  st_snaps: z.coerce.number().describe("Number of special teams snaps played"),
  st_pct: z.coerce.number().describe("Fraction (0-1) of the team's special teams snaps played by this player"),
});

const rostersSchema = z.object({
  season: z.coerce.number().describe("Season year"),
  team: z.coerce.string().describe("Team abbreviation"),
  position: nullishStringSub(
    z.enum([
      "OL",
      "QB",
      "K",
      "TE",
      "LS",
      "DL",
      "WR",
      "P",
      "DB",
      "LB",
      "RB",
      "T",
      "DT",
      "FS",
      "G",
      "FB",
      "OLB",
      "CB",
      "MLB",
      "ILB",
      "SS",
      "DE",
      "C",
      "NT",
      "S",
      "KR",
      "PR",
      "SPEC",
    ]),
  ).describe("Roster position: OL=Offensive Line, QB=Quarterback, K=Kicker, TE=Tight End, LS=Long Snapper, DL=Defensive Line, WR=Wide Receiver, P=Punter, DB=Defensive Back, LB=Linebacker, RB=Running Back, T=Tackle, DT=Defensive Tackle, FS=Free Safety, G=Guard, FB=Fullback, OLB=Outside Linebacker, CB=Cornerback, MLB=Middle Linebacker, ILB=Inside Linebacker, SS=Strong Safety, DE=Defensive End, C=Center, NT=Nose Tackle, S=Safety, KR=Kick Returner, PR=Punt Returner, SPEC=Special Teams; null when empty"),
  depth_chart_position: nullishStringSub(
    z.enum([
      "T",
      "QB",
      "K",
      "TE",
      "LS",
      "DE",
      "WR",
      "P",
      "FS",
      "G",
      "NT",
      "SS",
      "OLB",
      "CB",
      "DT",
      "RB",
      "C",
      "ILB",
      "MLB",
      "FB",
      "DB",
      "LB",
      "S",
      "OG",
      "OT",
      "OL",
      "SAF",
      "PR",
      "HB",
      "DL",
    ]),
  ).describe("Depth chart position: T=Tackle, QB=Quarterback, K=Kicker, TE=Tight End, LS=Long Snapper, DE=Defensive End, WR=Wide Receiver, P=Punter, FS=Free Safety, G=Guard, NT=Nose Tackle, SS=Strong Safety, OLB=Outside Linebacker, CB=Cornerback, DT=Defensive Tackle, RB=Running Back, C=Center, ILB=Inside Linebacker, MLB=Middle Linebacker, FB=Fullback, DB=Defensive Back, LB=Linebacker, S=Safety, OG=Offensive Guard, OT=Offensive Tackle, OL=Offensive Line, SAF=Safety, PR=Punt Returner, HB=Halfback, DL=Defensive Line; null when empty"),
  jersey_number: z.coerce.string().describe("Jersey number as a string"),
  status: nullishStringSub(
    z.enum([
      "CUT",
      "INA",
      "ACT",
      "RES",
      "DEV",
      "RET",
      "TRC",
      "TRT",
      "EXE",
      "PUP",
      "TRD",
      "RSN",
      "SUS",
      "NWT",
      "RSR",
      "UFA",
      "RFA",
      "E14",
    ]),
  ).describe("Roster status code: CUT=Cut, INA=Inactive, ACT=Active, RES=Reserve (injured), DEV=Developmental (practice squad), RET=Retired, TRD=Traded, EXE=Exempt, PUP=Physically Unable to Perform, SUS=Suspended, NWT=Not With Team, UFA=Unrestricted Free Agent, RFA=Restricted Free Agent; TRC, TRT, RSN, RSR and E14 are less common reserve/transaction codes whose exact meanings are not documented by the source; null when empty"),
  full_name: nullishString.describe("Player full name; null when empty"),
  first_name: z.coerce.string().describe("Player first name"),
  last_name: z.coerce.string().describe("Player last name"),
  birth_date: nullishString.describe("Informal, non-ISO birth date string from the source (e.g. 'Thu Jan 21 1982 16:00:00 GMT-0800 (Pacific Standard Time)'); prefer structured sources; null when empty"),
  height: nullishIntTx.describe("Height in inches; null when empty"),
  weight: nullishIntTx.describe("Weight in pounds; null when empty"),
  college: nullishString.describe("College attended; null when empty"),
  gsis_id: nullishString.describe("GSIS player identifier; null when empty"),
  espn_id: nullishString.describe("ESPN player identifier; null when empty"),
  sportradar_id: nullishString.describe("Sportradar player identifier; null when empty"),
  yahoo_id: nullishString.describe("Yahoo player identifier; null when empty"),
  rotowire_id: nullishString.describe("RotoWire player identifier; null when empty"),
  pff_id: nullishString.describe("Pro Football Focus player identifier; null when empty"),
  pfr_id: nullishString.describe("Pro-Football-Reference player identifier; null when empty"),
  fantasy_data_id: nullishString.describe("FantasyData player identifier; null when empty"),
  sleeper_id: nullishString.describe("Sleeper player identifier; null when empty"),
  esb_id: nullishString.describe("ESB player identifier; null when empty"),
  gsis_it_id: nullishString.describe("GSIS IT player identifier; null when empty"),
  smart_id: nullishString.describe("Smart ID player identifier; null when empty"),

  years_exp: nullishIntTx.describe("Years of NFL experience; null when empty"),
  headshot_url: nullishStringSub(z.url()).describe("Player headshot image URL; null when empty"),
  ngs_position: nullishStringSub(
    z.enum([
      "WR",
      "TE",
      "QB",
      "EDGE",
      "T",
      "INTERIOR_LINE",
      "CB",
      "SLOT_WR",
      "C",
      "SLOT_CB",
      "SAFETY",
      "MLB",
      "G",
      "OLB",
      "RB",
      "FB",
      "EXTRA_OL",
    ]),
  ).describe("Next Gen Stats position: WR=Wide Receiver, TE=Tight End, QB=Quarterback, EDGE=Edge Rusher, T=Tackle, INTERIOR_LINE=Interior Offensive Line, CB=Cornerback, SLOT_WR=Slot Wide Receiver, C=Center, SLOT_CB=Slot Cornerback, SAFETY=Safety, MLB=Middle Linebacker, G=Guard, OLB=Outside Linebacker, RB=Running Back, FB=Fullback, EXTRA_OL=Extra Offensive Lineman; null when empty"),
  week: z.coerce.number().describe("Week of the season this roster row reflects"),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "CON", "DIV", "SB"])).describe("Game type for the roster week: REG=Regular Season, WC=Wild Card, CON=Conference Championship, DIV=Divisional Playoff, SB=Super Bowl"),
  status_description_abbr: nullishString.describe("GSIS abbreviated roster status description code (opaque source code, e.g. 'W03', 'A01'); null when empty"),
  football_name: nullishString.describe("Player name as recorded by Next Gen Stats; null when empty"),
  entry_year: nullishIntTx.describe("Year the player first entered the NFL; null when empty"),
  rookie_year: nullishIntTx.describe("Player's rookie season year; null when empty"),
  draft_club: nullishString.describe("Drafting club abbreviation; null when empty"),
  draft_number: nullishIntTx.describe("Overall draft pick number; null when empty"),
});

// pfrAdvancedStats teams can show (N)TM for team name, this means 2+ teams
const pfrAdvStats_sznIdBase_schema = z.object({
  season: z.coerce.number().int().describe("Season year"),
  player: z.coerce.string().describe("Player's full name"),
  pfr_id: nullishString.describe(
    "Pro-Football-Reference player id. Null = not provided by PFR",
  ),
});

const pfrAdvStats_sznBase_schema = pfrAdvStats_sznIdBase_schema.extend({
  tm: z.coerce.string().describe(
    "Team abbreviation; '(N)TM' means the player played for multiple teams that season (N = number of teams)",
  ),
  age: z.coerce.number().describe("Player's age during the season"),
  g: z.coerce.number().describe("Games played"),
  gs: z.coerce.number().describe("Games started"),
});

const pfrAdvStats_sznDef_schema = pfrAdvStats_sznBase_schema.extend({
  pos: nullishString.describe(
    "Position(s) listed by PFR, often compound (e.g. 'LCB/RCB'). Null = not listed",
  ),
  int: nullishFloatTx.describe("Interceptions. Null = not recorded"),
  tgt: z.coerce.number().describe(
    "Targets: number of times the receiver this defender covered was targeted",
  ),
  cmp: z.coerce.number().describe("Completions allowed (passes completed against this defender)"),
  cmp_percent: nullishFloatTx.describe(
    "Completion percentage allowed (0-1 fraction). Null = not recorded",
  ),
  yds: z.coerce.number().describe("Yards allowed"),
  yds_cmp: nullishFloatTx.describe("Yards allowed per completion. Null = not recorded"),
  yds_tgt: nullishFloatTx.describe("Yards allowed per target. Null = not recorded"),
  td: nullishFloatTx.describe("Touchdowns allowed. Null = not recorded"),
  rat: nullishFloatTx.describe("Passer rating allowed when targeted. Null = not recorded"),
  dadot: nullishFloatTx.describe(
    "Depth of target: average depth of target allowed (yards). Null = not recorded",
  ),
  air: z.coerce.number().describe(
    "Completed air yards allowed (yards thrown in the air before the catch, excluding yards after catch)",
  ),
  yac: nullishFloatTx.describe("Yards after catch allowed. Null = not recorded"),
  blitz: z.coerce.number().describe("Times blitzed (rushed the passer as a blitzer)"),
  hrry: z.coerce.number().describe("Hurries (times the quarterback was hurried)"),
  qbkd: z.coerce.number().describe("Quarterback knockdowns"),
  sk: z.coerce.number().describe("Sacks"),
  prss: z.coerce.number().describe("Pressures (hurries + knockdowns + sacks)"),
  comb: z.coerce.number().describe("Combined tackles (solo + assisted)"),
  m_tkl: z.coerce.number().describe("Missed tackles"),
  m_tkl_percent: nullishFloatTx.describe(
    "Missed-tackle percentage (0-1 fraction). Null = not recorded",
  ),
  loaded: z.coerce.number().describe(
    "Plays against a loaded box (8+ defenders in the box)",
  ),
  bats: z.coerce.number().describe("Passes batted down (deflections at the line of scrimmage)"),
});

const pfrAdvStats_sznPass_schema = pfrAdvStats_sznIdBase_schema.extend({
  team: z.coerce.string().describe("Team abbreviation"),
  pass_attempts: z.coerce.number().describe("Pass attempts"),
  throwaways: z.coerce.number().describe("Throwaways (passes intentionally thrown away to avoid a sack)"),
  spikes: z.coerce.number().describe("Spikes (passes spiked into the ground to stop the clock)"),
  drops: z.coerce.number().describe("Drops by receivers on this quarterback's passes"),
  drop_pct: nullishFloatTx.describe("Drop percentage (0-1 fraction). Null = not recorded"),
  bad_throws: z.coerce.number().describe("Bad throws (inaccurate passes judged uncatchable)"),
  bad_throw_pct: nullishFloatTx.describe(
    "Bad-throw percentage (0-1 fraction). Null = not recorded",
  ),
  pocket_time: nullishFloatTx.describe(
    "Average time in the pocket before throwing (seconds). Null = not recorded",
  ),
  times_blitzed: z.coerce.number().describe("Times blitzed"),
  times_hurried: z.coerce.number().describe("Times hurried"),
  times_hit: z.coerce.number().describe("Times hit while throwing"),
  times_pressured: z.coerce.number().describe("Times pressured (hurries + hits + sacks)"),
  pressure_pct: nullishFloatTx.describe("Pressure percentage (0-1 fraction). Null = not recorded"),
  batted_balls: nullishFloatTx.describe(
    "Passes batted down at the line of scrimmage. Null = not recorded",
  ),
  on_tgt_throws: nullishFloatTx.describe(
    "On-target throws (accurate, catchable passes). Null = not recorded",
  ),
  on_tgt_pct: nullishFloatTx.describe(
    "On-target throw percentage (0-1 fraction). Null = not recorded",
  ),
  rpo_plays: nullishFloatTx.describe("Run-pass option plays. Null = not recorded"),
  rpo_yards: nullishFloatTx.describe(
    "Yards gained on run-pass option plays. Null = not recorded",
  ),
  rpo_pass_att: nullishFloatTx.describe(
    "Pass attempts from run-pass option plays. Null = not recorded",
  ),
  rpo_pass_yards: nullishFloatTx.describe(
    "Passing yards from run-pass option plays. Null = not recorded",
  ),
  rpo_rust_att: nullishFloatTx.describe(
    "Rush attempts from run-pass option plays (plays kept by the quarterback). Null = not recorded",
  ),
  rpo_rush_yards: nullishFloatTx.describe(
    "Rushing yards from run-pass option plays. Null = not recorded",
  ),
  pa_pass_att: nullishFloatTx.describe("Play-action pass attempts. Null = not recorded"),
  pa_pass_yards: nullishFloatTx.describe("Play-action passing yards. Null = not recorded"),
  intended_air_yards: nullishFloatTx.describe(
    "Total intended air yards (air yards on all attempts, completed or not). Null = not recorded",
  ),
  intended_air_yards_per_pass_attempt: nullishFloatTx.describe(
    "Intended air yards per pass attempt. Null = not recorded",
  ),
  completed_air_yards: nullishFloatTx.describe(
    "Total completed air yards (air yards on completed passes). Null = not recorded",
  ),
  completed_air_yards_per_completion: nullishFloatTx.describe(
    "Completed air yards per completion. Null = not recorded",
  ),
  completed_air_yards_per_pass_attempt: nullishFloatTx.describe(
    "Completed air yards per pass attempt. Null = not recorded",
  ),
  pass_yards_after_catch: nullishFloatTx.describe(
    "Passing yards after catch (YAC gained by receivers on this quarterback's completions). Null = not recorded",
  ),
  pass_yards_after_catch_per_completion: nullishFloatTx.describe(
    "Passing yards after catch per completion. Null = not recorded",
  ),
  scrambles: nullishFloatTx.describe(
    "Scrambles (rushes by the quarterback after dropping back to pass). Null = not recorded",
  ),
  scramble_yards_per_attempt: nullishFloatTx.describe(
    "Scramble yards per attempt. Null = not recorded",
  ),
});
const pfrAdvStats_sznRushRecBase_schema = pfrAdvStats_sznBase_schema.extend({
  pos: nullishStringSub(
    z.enum([
      "RB",
      "QB",
      "WR",
      "FB",
      "TE",
      "DB",
      "P",
      "K",
      "SS",
      "LDE",
      "RDE",
      "FS/SS",
      "LG",
      "WR/QB",
      "RLB",
      "LB",
      "FS",
      "C",
      "S",
      "OL",
      "CB",
      "K-P",
      "LT",
      "T",
      "LDT",
      "DE",
      "RT",
      "RG",
      "NT",
      "G",
      "RT/LT",
      "RCB",
      "LB/OLB",
      "DT",
      "FB/DL",
      "LLB",
      "OT",
      "MLB",
      "LILB",
      "RILB",
      "LCB",
      "LCB/RCB",
      "RCB/LCB",
      "NT/RDT",
      "LOLB",
      "RDT",
      "DB/RCB",
      "LCB/FS",
      "SS/LCB",
      "RCB/DB",
      "ROLB",
      "LDE/RDE",
      "RDE/NT",
      "LLB/MLB",
      "RCB/SS",
      "LDT/RDT",
      "DE/ROLB",
      "RDE/LDT",
      "DE/RDE",
      "RDE/LDE",
      "DT/FB",
      "ROLB/RILB",
      "LILB/RILB",
      "MLB/RLB",
      "DB/FS",
      "RCB/FS",
      "DB/LCB",
      "SS/FS",
      "LB/RLB",
      "LB/ROLB",
      "LB/RILB",
      "RDT/LDT",
      "DL",
      "LB/LILB",
      "RLB/LLB",
      "RLB/MLB",
      "RILB/LILB",
      "SS/RLB",
      "DE/DT",
      "OLB",
      "ROLB/LOLB",
      "LB/LDE",
      "DE/LOLB",
      "DT/NT",
      "DT/DE",
      "LS",
      "MLB/RILB",
      "LOLB/ROLB",
      "ROLB/LILB",
      "LOLB/RDE",
      "CB/RCB",
      "LDT/LDE",
      "RDT/RDE",
      "RDT/LDE",
      "DE/LDE",
      "RG/C",
      "CB/DB",
      "DE/DL",
      "DE/OLB",
      "DB/S",
      "S-SS",
      "FS-S-SS",
      "LCB-RCB",
      "LB-LLB",
      "CB-RCB",
      "LDE-RDE",
      "NT-RDE",
      "CB-DB",
      "DB-S",
      "DT-LDE/RDE",
      "DT-LDT",
      "DE-RDE",
      "DB-NT",
      "DE-LB",
      "DE-DT",
    ]),
  ).describe(
    "Position(s) listed by PFR, often compound (e.g. 'LCB/RCB' or 'WR/QB'). Null = not listed",
  ),
});

const pfrAdvStats_sznRush_schema = pfrAdvStats_sznRushRecBase_schema.extend({
  att: z.coerce.number().describe("Rush attempts"),
  yds: z.coerce.number().describe("Rushing yards"),
  td: nullishFloatTx.describe("Rushing touchdowns. Null = not recorded"),
  x1d: nullishFloatTx.describe("Rushing first downs. Null = not recorded"),
  ybc: nullishFloatTx.describe("Yards before contact. Null = not recorded"),
  ybc_att: nullishFloatTx.describe("Yards before contact per attempt. Null = not recorded"),
  yac: nullishFloatTx.describe("Yards after contact. Null = not recorded"),
  yac_att: nullishFloatTx.describe("Yards after contact per attempt. Null = not recorded"),
  brk_tkl: nullishFloatTx.describe("Broken tackles. Null = not recorded"),
  att_br: nullishFloatTx.describe("Rush attempts per broken tackle. Null = not recorded"),
  loaded: z.coerce.number().describe(
    "Carries against a loaded box (8+ defenders in the box)",
  ),
});
const pfrAdvStats_sznRec_schema = pfrAdvStats_sznRushRecBase_schema.extend({
  tgt: z.coerce.number().describe("Targets (times this receiver was targeted)"),
  rec: z.coerce.number().describe("Receptions"),
  yds: z.coerce.number().describe("Receiving yards"),
  td: nullishFloatTx.describe("Receiving touchdowns. Null = not recorded"),
  x1d: nullishFloatTx.describe("Receiving first downs. Null = not recorded"),
  ybc: nullishFloatTx.describe("Yards before catch (air yards on completed passes). Null = not recorded"),
  ybc_r: nullishFloatTx.describe("Yards before catch per reception. Null = not recorded"),
  yac: nullishFloatTx.describe("Yards after catch. Null = not recorded"),
  yac_r: nullishFloatTx.describe("Yards after catch per reception. Null = not recorded"),
  adot: nullishFloatTx.describe("Average depth of target (yards). Null = not recorded"),
  brk_tkl: nullishFloatTx.describe("Broken tackles after the catch. Null = not recorded"),
  rec_br: nullishFloatTx.describe("Receptions per broken tackle. Null = not recorded"),
  drop: nullishFloatTx.describe("Drops. Null = not recorded"),
  drop_percent: nullishFloatTx.describe("Drop percentage (0-1 fraction). Null = not recorded"),
  int: nullishFloatTx.describe(
    "Interceptions thrown when targeting this receiver. Null = not recorded",
  ),
  rat: nullishFloatTx.describe("Passer rating when targeted. Null = not recorded"),
  loaded: z.coerce.number().describe(
    "Targets against a loaded box (8+ defenders in the box)",
  ),
});
const pfrAdvStats_wkBase_schema = z.object({
  game_id: z.coerce.string().describe("nflverse game id"),
  pfr_game_id: z.coerce.string().describe("Pro-Football-Reference game id"),
  season: z.coerce.number().int().describe("Season year"),
  week: z.coerce.number().int().describe("Week number"),
  game_type: z
    .pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"]))
    .describe(
      "Game type: REG (regular season), WC (wild card), DIV (divisional round), CON (conference championship), SB (Super Bowl)",
    ),
  team: z.coerce.string().describe("Team abbreviation"),
  opponent: z.coerce.string().describe("Opponent team abbreviation"),
  pfr_player_name: z.coerce.string().describe("Player's full name (PFR)"),
  pfr_player_id: z.coerce.string().describe("Pro-Football-Reference player id"),
});

const pfrAdvStats_wkDef_schema = pfrAdvStats_wkBase_schema.extend({
  def_ints: z.coerce.number().describe("Interceptions"),
  def_targets: z.coerce.number().describe(
    "Targets (times the receiver this defender covered was targeted)",
  ),
  def_completions_allowed: z.coerce.number().describe("Completions allowed"),
  def_completion_pct: nullishFloatTx.describe(
    "Completion percentage allowed (0-1 fraction). Null = not recorded",
  ),
  def_yards_allowed: nullishFloatTx.describe("Yards allowed. Null = not recorded"),
  def_yards_allowed_per_cmp: nullishFloatTx.describe(
    "Yards allowed per completion. Null = not recorded",
  ),
  def_yards_allowed_per_tgt: nullishFloatTx.describe(
    "Yards allowed per target. Null = not recorded",
  ),
  def_receiving_td_allowed: nullishFloatTx.describe(
    "Receiving touchdowns allowed. Null = not recorded",
  ),
  def_passer_rating_allowed: nullishFloatTx.describe(
    "Passer rating allowed when targeted. Null = not recorded",
  ),
  def_adot: nullishFloatTx.describe(
    "Average depth of target allowed (yards). Null = not recorded",
  ),
  def_air_yards_completed: nullishFloatTx.describe(
    "Completed air yards allowed. Null = not recorded",
  ),
  def_yards_after_catch: nullishFloatTx.describe(
    "Yards after catch allowed. Null = not recorded",
  ),
  def_times_blitzed: nullishFloatTx.describe("Times blitzed. Null = not recorded"),
  def_times_hurried: nullishFloatTx.describe("Times hurried. Null = not recorded"),
  def_times_hitqb: nullishFloatTx.describe(
    "Times hit the quarterback. Null = not recorded",
  ),
  def_sacks: z.coerce.number().describe("Sacks"),
  def_pressures: z.coerce.number().describe("Pressures (hurries + knockdowns + sacks)"),
  def_tackles_combined: z.coerce.number().describe("Combined tackles (solo + assisted)"),
  def_missed_tackles: z.coerce.number().describe("Missed tackles"),
  def_missed_tackle_pct: nullishFloatTx.describe(
    "Missed-tackle percentage (0-1 fraction). Null = not recorded",
  ),
});
const pfrAdvStats_wkPassRecBase_schema = pfrAdvStats_wkBase_schema.extend({
  passing_drops: nullishFloatTx.describe(
    "Drops by receivers on this quarterback's passes. Null = not recorded",
  ),
  passing_drop_pct: nullishFloatTx.describe(
    "Passing drop percentage (0-1 fraction). Null = not recorded",
  ),
  receiving_drop: nullishFloatTx.describe(
    "Drops by this player as a receiver. Null = not recorded",
  ),
  receiving_drop_pct: nullishFloatTx.describe(
    "Receiving drop percentage (0-1 fraction). Null = not recorded",
  ),
});

const pfrAdvStats_wkPass_schema = pfrAdvStats_wkPassRecBase_schema.extend({
  passing_bad_throws: z.coerce.number().describe("Bad throws (inaccurate passes judged uncatchable)"),
  passing_bad_throw_pct: nullishFloatTx.describe(
    "Bad-throw percentage (0-1 fraction). Null = not recorded",
  ),
  times_sacked: z.coerce.number().describe("Times sacked"),
  times_blitzed: z.coerce.number().describe("Times blitzed"),
  times_hurried: z.coerce.number().describe("Times hurried"),
  times_hit: z.coerce.number().describe("Times hit while throwing"),
  times_pressured: z.coerce.number().describe("Times pressured (hurries + hits + sacks)"),
  times_pressured_pct: nullishFloatTx.describe(
    "Pressure percentage (0-1 fraction). Null = not recorded",
  ),
  def_times_blitzed: nullishFloatTx.describe(
    "Times blitzed as a defender. Null = not recorded",
  ),
  def_times_hurried: nullishFloatTx.describe(
    "Times hurried as a defender. Null = not recorded",
  ),
  def_times_hitqb: nullishFloatTx.describe(
    "Times hit the quarterback as a defender. Null = not recorded",
  ),
});
const pfrAdvStats_wkRec_schema = pfrAdvStats_wkPassRecBase_schema.extend({
  rushing_broken_tackles: nullishFloatTx.describe(
    "Broken tackles as a rusher. Null = not recorded",
  ),
  receiving_broken_tackles: nullishFloatTx.describe(
    "Broken tackles as a receiver. Null = not recorded",
  ),
  receiving_int: z.coerce.number().describe("Interceptions thrown when targeting this receiver"),
  receiving_rat: z.coerce.number().describe("Passer rating when targeting this receiver"),
});
const pfrAdvStats_wkRush_schema = pfrAdvStats_wkBase_schema.extend({
  carries: z.coerce.number().describe("Rush attempts (carries)"),
  rushing_yards_before_contact: z.coerce.number().describe("Rushing yards before contact"),
  rushing_yards_before_contact_avg: nullishFloatTx.describe(
    "Rushing yards before contact per attempt. Null = not recorded",
  ),
  rushing_yards_after_contact: z.coerce.number().describe("Rushing yards after contact"),
  rushing_yards_after_contact_avg: nullishFloatTx.describe(
    "Rushing yards after contact per attempt. Null = not recorded",
  ),
  rushing_broken_tackles: nullishFloatTx.describe(
    "Broken tackles as a rusher. Null = not recorded",
  ),
  receiving_broken_tackles: nullishFloatTx.describe(
    "Broken tackles as a receiver. Null = not recorded",
  ),
});

const pbpSchema = z.object({
  play_id: z.coerce.string().describe(
    "Unique play identifier: game_id plus a zero-padded play sequence number.",
  ),
  game_id: z.coerce.string().describe(
    "nflverse game identifier, formatted YYYYMMDDxx where xx is a two-character game code.",
  ),
  old_game_id: z.coerce.string().describe(
    "Deprecated legacy game identifier from earlier nflverse releases, kept for compatibility.",
  ),
  home_team: z.coerce.string().describe("Home team abbreviation (e.g. KC)."),
  away_team: z.coerce.string().describe("Away team abbreviation (e.g. SF)."),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["REG", "POST"]))
    .describe("Season phase: REG = regular season, POST = postseason."),
  week: z.coerce
    .number()
    .int()
    .describe(
      "Week of the season (1-18 regular season; 19+ are postseason rounds).",
    ),
  posteam: nullishString.describe(
    "Abbreviation of the team with possession on the play; null when no team has possession.",
  ),
  posteam_type: nullishStringSub(z.enum(["away", "home"])).describe(
    "Whether the possession team (posteam) is the away or home team; null when no posteam.",
  ),
  defteam: nullishString.describe(
    "Abbreviation of the defensive team on the play; null when not applicable.",
  ),
  side_of_field: z.coerce.string().describe(
    "Which team's side of the field the ball is on: team abbreviation, or 50 at midfield.",
  ),
  yardline_100: nullishFloatTx.describe(
    "Distance in yards from the offense's own end zone (0-100); null for non-offensive plays.",
  ),
  game_date: z
    .pipe(z.coerce.string(), z.iso.date())
    .describe("Kickoff date of the game, ISO 8601 (YYYY-MM-DD)."),
  quarter_seconds_remaining: nullishFloatTx.describe(
    "Seconds remaining in the quarter at the start of the play (900 at quarter start); null in overtime.",
  ),
  half_seconds_remaining: nullishFloatTx.describe(
    "Seconds remaining in the half at the start of the play (1800 at half start); null in overtime.",
  ),
  game_seconds_remaining: nullishFloatTx.describe(
    "Seconds remaining in the game at the start of the play (3600 at game start).",
  ),
  game_half: z
    .pipe(z.coerce.string(), z.enum(["Half1", "Half2", "Overtime"]))
    .describe("Game period: Half1 = first half, Half2 = second half, Overtime."),
  quarter_end: boolZ1.describe(
    "1 if the play ended a quarter, 0 otherwise.",
  ),
  drive: nullishFloatTx.describe(
    "Drive number of the game for the possession team (1-indexed); null when not applicable.",
  ),
  sp: boolZ1.describe(
    "1 if the play was a scoring play (touchdown, field goal, safety, etc.), 0 otherwise.",
  ),
  qtr: z.coerce
    .number()
    .describe("Quarter of the game (1-4; 5 = overtime)."),
  down: nullishFloatTx.describe(
    "Down of the play (1-4); null for kickoffs and other non-scrimmage plays.",
  ),
  goal_to_go: nullishFloatTx.describe(
    "1 if the offense is within 10 yards of the end zone (goal-to-go), 0 otherwise; null for non-offensive plays.",
  ),
  time: nullishString.describe(
    "Game clock at the start of the play as string MM:SS (max 15:00).",
  ),
  yrdln: nullishString.describe(
    "Yard line at the start of the play, formatted 'TEAM YARDLINE' (e.g. 'ARI 40') or '50' at midfield.",
  ),
  ydstogo: z.coerce.number().describe(
    "Yards to go for a first down (or touchdown in goal-to-go situations).",
  ),
  ydsnet: nullishFloatTx.describe(
    "Net yards gained or lost by the offense on the play (negative for losses); null on kickoffs.",
  ),
  desc: z.coerce.string().describe(
    "Detailed natural-language description of the play.",
  ),
  play_type: nullishStringSub(
    z.enum([
      "kickoff",
      "run",
      "pass",
      "extra_point",
      "field_goal",
      "no_play",
      "qb_kneel",
      "punt",
      "qb_spike",
    ]),
  ).describe(
    "Play type: kickoff, run, pass, extra_point, field_goal, no_play, qb_kneel, punt, or qb_spike; null when unknown.",
  ),
  yards_gained: nullishFloatTx.describe(
    "Yards gained by the offense on the play (negative for losses); null on kickoffs and punts.",
  ),
  shotgun: boolZ1.describe(
    "1 if the offense lined up in shotgun formation, 0 otherwise.",
  ),
  no_huddle: boolZ1.describe(
    "1 if the offense ran the play without a huddle, 0 otherwise.",
  ),
  qb_dropback: boolZ1N.describe(
    "Tri-state: 1 if the QB dropped back to pass (includes sacks, scrambles, and pass attempts), 0 if no dropback, null when unknown.",
  ),
  qb_kneel: boolZ1N.describe(
    "Tri-state: 1 if the QB took a knee, 0 otherwise, null when unknown.",
  ),
  qb_spike: boolZ1N.describe(
    "Tri-state: 1 if the QB spiked the ball, 0 otherwise, null when unknown.",
  ),
  qb_scramble: boolZ1N.describe(
    "Tri-state: 1 if the QB scrambled on a dropback, 0 otherwise, null when unknown.",
  ),
  pass_length: nullishStringSub(z.enum(["short", "deep"])).describe(
    "Pass target depth classification: short or deep (based on air yards); null on non-pass plays.",
  ),
  pass_location: nullishStringSub(z.enum(["left", "middle", "right"])).describe(
    "Direction of the pass attempt: left, middle, or right; null on non-pass plays.",
  ),
  air_yards: nullishFloatTx.describe(
    "Air yards of the pass: distance from the line of scrimmage to the intended receiver (negative when behind the line); null on non-pass plays.",
  ),
  yards_after_catch: nullishFloatTx.describe(
    "Yards gained after the catch by the receiver; null on non-pass or incomplete plays.",
  ),
  run_location: nullishStringSub(z.enum(["middle", "left", "right"])).describe(
    "Direction of the run: middle, left, or right; null on non-run plays.",
  ),
  run_gap: nullishStringSub(z.enum(["guard", "end", "tackle"])).describe(
    "Offensive line gap the run was aimed at: guard, tackle, or end; null on non-run plays.",
  ),
  field_goal_result: nullishStringSub(z.enum(["made", "missed", "blocked"])).describe(
    "Field goal outcome: made, missed, or blocked; null on non-field-goal plays.",
  ),
  kick_distance: nullishFloatTx.describe(
    "Distance of the kick in yards (kickoff, punt, or field goal); null on non-kick plays.",
  ),
  extra_point_result: nullishStringSub(
    z.enum(["good", "failed", "blocked", "aborted"]),
  ).describe(
    "Extra point outcome: good, failed, blocked, or aborted; null on non-extra-point plays.",
  ),
  two_point_conv_result: nullishStringSub(z.enum(["success", "failure"])).describe(
    "Two-point conversion outcome: success or failure; null on non-two-point-attempt plays.",
  ),
  home_timeouts_remaining: z.coerce.number().describe(
    "Timeouts remaining for the home team at the start of the play.",
  ),
  away_timeouts_remaining: z.coerce.number().describe(
    "Timeouts remaining for the away team at the start of the play.",
  ),
  timeout: boolZ1N.describe(
    "Tri-state: 1 if a timeout was charged on this play, 0 otherwise, null when unknown.",
  ),
  timeout_team: nullishString.describe(
    "Abbreviation of the team charged with the timeout; null if no timeout on the play.",
  ),
  td_team: nullishString.describe(
    "Abbreviation of the team that scored a touchdown on the play; null if no touchdown.",
  ),
  td_player_name: nullishString.describe(
    "Short name (e.g. A.Rodgers) of the player who scored the touchdown; null if no touchdown.",
  ),
  td_player_id: nullishString.describe(
    "GSIS player ID (00- format) of the touchdown scorer; null if no touchdown.",
  ),
  posteam_timeouts_remaining: nullishFloatTx.describe(
    "Timeouts remaining for the possession team at the start of the play; null when no posteam.",
  ),
  defteam_timeouts_remaining: nullishFloatTx.describe(
    "Timeouts remaining for the defensive team at the start of the play; null when no defteam.",
  ),
  total_home_score: z.coerce.number().describe(
    "Home team's total score after the play.",
  ),
  total_away_score: z.coerce.number().describe(
    "Away team's total score after the play.",
  ),
  posteam_score: nullishFloatTx.describe(
    "Possession team's score after the play; null when no posteam.",
  ),
  defteam_score: nullishFloatTx.describe(
    "Defensive team's score after the play; null when no defteam.",
  ),
  score_differential: nullishFloatTx.describe(
    "Score differential (possession team minus defensive team) after the play; null when not applicable.",
  ),
  posteam_score_post: nullishFloatTx.describe(
    "Possession team's score after the play, recomputed from fixed drive data; null when no posteam.",
  ),
  defteam_score_post: nullishFloatTx.describe(
    "Defensive team's score after the play, recomputed from fixed drive data; null when no defteam.",
  ),
  score_differential_post: nullishFloatTx.describe(
    "Score differential after the play, recomputed from fixed drive data; null when not applicable.",
  ),
  no_score_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) that the current drive ends without a score.",
  ),
  opp_fg_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) that the opposing team scores a field goal on the drive.",
  ),
  opp_safety_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) that the opposing team scores a safety on the drive.",
  ),
  opp_td_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) that the opposing team scores a touchdown on the drive.",
  ),
  fg_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) that the possession team scores a field goal on the drive.",
  ),
  safety_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) that the possession team scores a safety on the drive.",
  ),
  td_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) that the possession team scores a touchdown on the drive.",
  ),
  extra_point_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) of a successful extra point attempt.",
  ),
  two_point_conversion_prob: z.coerce.number().describe(
    "nflfastR model output: probability (0-1) of a successful two-point conversion attempt.",
  ),
  ep: nullishFloatTx.describe(
    "Expected points (nflfastR model) before the play.",
  ),
  epa: nullishFloatTx.describe(
    "Expected points added by the play (nflfastR model, in points); null on kickoffs and other plays without EPA.",
  ),
  total_home_epa: z.coerce.number().describe(
    "Cumulative EPA (in points) for the home team in the game up to and including this play.",
  ),
  total_away_epa: z.coerce.number().describe(
    "Cumulative EPA (in points) for the away team in the game up to and including this play.",
  ),
  total_home_rush_epa: z.coerce.number().describe(
    "Cumulative rushing EPA (in points) for the home team in the game.",
  ),
  total_away_rush_epa: z.coerce.number().describe(
    "Cumulative rushing EPA (in points) for the away team in the game.",
  ),
  total_home_pass_epa: z.coerce.number().describe(
    "Cumulative passing EPA (in points) for the home team in the game.",
  ),
  total_away_pass_epa: z.coerce.number().describe(
    "Cumulative passing EPA (in points) for the away team in the game.",
  ),
  air_epa: nullishFloatTx.describe(
    "EPA (in points) attributed to the air yards of the pass (nflfastR decomposition); null on non-pass plays.",
  ),
  yac_epa: nullishFloatTx.describe(
    "EPA (in points) attributed to yards after catch (nflfastR decomposition); null on non-pass plays.",
  ),
  comp_air_epa: nullishFloatTx.describe(
    "Air EPA (in points) on completed passes only; null on incompletions and non-pass plays.",
  ),
  comp_yac_epa: nullishFloatTx.describe(
    "YAC EPA (in points) on completed passes only; null on incompletions and non-pass plays.",
  ),
  total_home_comp_air_epa: nullishFloatTx.describe(
    "Cumulative air EPA (in points) on completed passes for the home team.",
  ),
  total_away_comp_air_epa: nullishFloatTx.describe(
    "Cumulative air EPA (in points) on completed passes for the away team.",
  ),
  total_home_comp_yac_epa: nullishFloatTx.describe(
    "Cumulative YAC EPA (in points) on completed passes for the home team.",
  ),
  total_away_comp_yac_epa: nullishFloatTx.describe(
    "Cumulative YAC EPA (in points) on completed passes for the away team.",
  ),
  total_home_raw_air_epa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) air EPA (in points) for the home team.",
  ),
  total_away_raw_air_epa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) air EPA (in points) for the away team.",
  ),
  total_home_raw_yac_epa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) YAC EPA (in points) for the home team.",
  ),
  total_away_raw_yac_epa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) YAC EPA (in points) for the away team.",
  ),
  wp: nullishFloatTx.describe(
    "Win probability (0-1) for the possession team before the play (nflfastR model); null when no posteam.",
  ),
  def_wp: nullishFloatTx.describe(
    "Win probability (0-1) for the defensive team before the play (nflfastR model); null when no defteam.",
  ),
  home_wp: z.coerce.number().describe(
    "Win probability (0-1) for the home team before the play (nflfastR model).",
  ),
  away_wp: z.coerce.number().describe(
    "Win probability (0-1) for the away team before the play (nflfastR model).",
  ),
  wpa: nullishFloatTx.describe(
    "Win probability added by the play (post-play minus pre-play WP from the possession team's perspective); null when not applicable.",
  ),
  vegas_wpa: nullishFloatTx.describe(
    "Win probability added by the play using Vegas-implied win probability; null when not applicable.",
  ),
  vegas_home_wpa: nullishFloatTx.describe(
    "Vegas-based win probability added by the play from the home team's perspective; null when not applicable.",
  ),
  home_wp_post: nullishFloatTx.describe(
    "Home team's win probability (0-1) after the play, recomputed from fixed drive data; null when unavailable.",
  ),
  away_wp_post: nullishFloatTx.describe(
    "Away team's win probability (0-1) after the play, recomputed from fixed drive data; null when unavailable.",
  ),
  vegas_wp: nullishFloatTx.describe(
    "Win probability (0-1) for the possession team implied by the pre-game Vegas line; null when no posteam.",
  ),
  vegas_home_wp: z.coerce.number().describe(
    "Win probability (0-1) for the home team implied by the pre-game Vegas line.",
  ),
  total_home_rush_wpa: z.coerce.number().describe(
    "Cumulative rushing WPA for the home team in the game.",
  ),
  total_away_rush_wpa: z.coerce.number().describe(
    "Cumulative rushing WPA for the away team in the game.",
  ),
  total_home_pass_wpa: z.coerce.number().describe(
    "Cumulative passing WPA for the home team in the game.",
  ),
  total_away_pass_wpa: z.coerce.number().describe(
    "Cumulative passing WPA for the away team in the game.",
  ),
  air_wpa: nullishFloatTx.describe(
    "WPA attributed to the air yards of the pass (nflfastR decomposition); null on non-pass plays.",
  ),
  yac_wpa: nullishFloatTx.describe(
    "WPA attributed to yards after catch (nflfastR decomposition); null on non-pass plays.",
  ),
  comp_air_wpa: nullishFloatTx.describe(
    "Air WPA on completed passes only; null on incompletions and non-pass plays.",
  ),
  comp_yac_wpa: nullishFloatTx.describe(
    "YAC WPA on completed passes only; null on incompletions and non-pass plays.",
  ),
  total_home_comp_air_wpa: nullishFloatTx.describe(
    "Cumulative air WPA on completed passes for the home team.",
  ),
  total_away_comp_air_wpa: nullishFloatTx.describe(
    "Cumulative air WPA on completed passes for the away team.",
  ),
  total_home_comp_yac_wpa: nullishFloatTx.describe(
    "Cumulative YAC WPA on completed passes for the home team.",
  ),
  total_away_comp_yac_wpa: nullishFloatTx.describe(
    "Cumulative YAC WPA on completed passes for the away team.",
  ),
  total_home_raw_air_wpa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) air WPA for the home team.",
  ),
  total_away_raw_air_wpa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) air WPA for the away team.",
  ),
  total_home_raw_yac_wpa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) YAC WPA for the home team.",
  ),
  total_away_raw_yac_wpa: nullishFloatTx.describe(
    "Cumulative raw (uncapped) YAC WPA for the away team.",
  ),
  punt_blocked: boolZ1N.describe(
    "Tri-state: 1 if the punt was blocked, 0 otherwise, null when not applicable.",
  ),
  first_down_rush: boolZ1N.describe(
    "Tri-state: 1 if the play earned a first down by rushing, 0 otherwise, null when not applicable.",
  ),
  first_down_pass: boolZ1N.describe(
    "Tri-state: 1 if the play earned a first down by passing, 0 otherwise, null when not applicable.",
  ),
  first_down_penalty: boolZ1N.describe(
    "Tri-state: 1 if the play earned a first down by penalty, 0 otherwise, null when not applicable.",
  ),
  third_down_converted: boolZ1N.describe(
    "Tri-state: 1 if a third down was converted, 0 otherwise, null when not applicable.",
  ),
  third_down_failed: boolZ1N.describe(
    "Tri-state: 1 if a third down attempt failed, 0 otherwise, null when not applicable.",
  ),
  fourth_down_converted: boolZ1N.describe(
    "Tri-state: 1 if a fourth down was converted, 0 otherwise, null when not applicable.",
  ),
  fourth_down_failed: boolZ1N.describe(
    "Tri-state: 1 if a fourth down attempt failed, 0 otherwise, null when not applicable.",
  ),
  incomplete_pass: boolZ1N.describe(
    "Tri-state: 1 if the pass was incomplete, 0 otherwise, null when not applicable.",
  ),
  touchback: boolZ1N.describe(
    "Tri-state: 1 if the play resulted in a touchback, 0 otherwise, null when not applicable.",
  ),
  interception: boolZ1N.describe(
    "Tri-state: 1 if the pass was intercepted, 0 otherwise, null when not applicable.",
  ),
  punt_inside_twenty: boolZ1N.describe(
    "Tri-state: 1 if the punt landed inside the 20-yard line, 0 otherwise, null when not applicable.",
  ),
  punt_in_endzone: boolZ1N.describe(
    "Tri-state: 1 if the punt landed in the end zone, 0 otherwise, null when not applicable.",
  ),
  punt_out_of_bounds: boolZ1N.describe(
    "Tri-state: 1 if the punt went out of bounds, 0 otherwise, null when not applicable.",
  ),
  punt_downed: boolZ1N.describe(
    "Tri-state: 1 if the punt was downed by the kicking team, 0 otherwise, null when not applicable.",
  ),
  punt_fair_catch: boolZ1N.describe(
    "Tri-state: 1 if the punt was fair-caught, 0 otherwise, null when not applicable.",
  ),
  kickoff_inside_twenty: boolZ1N.describe(
    "Tri-state: 1 if the kickoff landed inside the 20-yard line, 0 otherwise, null when not applicable.",
  ),
  kickoff_in_endzone: boolZ1N.describe(
    "Tri-state: 1 if the kickoff landed in the end zone, 0 otherwise, null when not applicable.",
  ),
  kickoff_out_of_bounds: boolZ1N.describe(
    "Tri-state: 1 if the kickoff went out of bounds, 0 otherwise, null when not applicable.",
  ),
  kickoff_downed: boolZ1N.describe(
    "Tri-state: 1 if the kickoff was downed by the kicking team, 0 otherwise, null when not applicable.",
  ),
  kickoff_fair_catch: boolZ1N.describe(
    "Tri-state: 1 if the kickoff was fair-caught, 0 otherwise, null when not applicable.",
  ),
  fumble_forced: boolZ1N.describe(
    "Tri-state: 1 if a fumble was forced on the play, 0 otherwise, null when not applicable.",
  ),
  fumble_not_forced: boolZ1N.describe(
    "Tri-state: 1 if a fumble occurred without being forced, 0 otherwise, null when not applicable.",
  ),
  fumble_out_of_bounds: boolZ1N.describe(
    "Tri-state: 1 if a fumble went out of bounds, 0 otherwise, null when not applicable.",
  ),
  solo_tackle: boolZ1N.describe(
    "Tri-state: 1 if a solo tackle was recorded (see solo_tackle_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  safety: boolZ1N.describe(
    "Tri-state: 1 if the play resulted in a safety, 0 otherwise, null when not applicable.",
  ),
  penalty: boolZ1N.describe(
    "Tri-state: 1 if a penalty was called on the play, 0 otherwise, null when not applicable.",
  ),
  tackled_for_loss: boolZ1N.describe(
    "Tri-state: 1 if the ball carrier was tackled for a loss (see tackle_for_loss_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  fumble_lost: boolZ1N.describe(
    "Tri-state: 1 if the fumble was lost to the opposing team, 0 otherwise, null when not applicable.",
  ),
  own_kickoff_recovery: boolZ1N.describe(
    "Tri-state: 1 if the kicking team recovered its own kickoff, 0 otherwise, null when not applicable.",
  ),
  own_kickoff_recovery_td: boolZ1N.describe(
    "Tri-state: 1 if the kicking team recovered its own kickoff and returned it for a touchdown, 0 otherwise, null when not applicable.",
  ),
  qb_hit: boolZ1N.describe(
    "Tri-state: 1 if the QB was hit on a dropback (see qb_hit_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  rush_attempt: boolZ1N.describe(
    "Tri-state: 1 if a rushing attempt occurred, 0 otherwise, null when not applicable.",
  ),
  pass_attempt: boolZ1N.describe(
    "Tri-state: 1 if a passing attempt occurred, 0 otherwise, null when not applicable.",
  ),
  sack: boolZ1N.describe(
    "Tri-state: 1 if the QB was sacked, 0 otherwise, null when not applicable.",
  ),
  touchdown: boolZ1N.describe(
    "Tri-state: 1 if a touchdown was scored on the play, 0 otherwise, null when not applicable.",
  ),
  pass_touchdown: boolZ1N.describe(
    "Tri-state: 1 if a passing touchdown was scored, 0 otherwise, null when not applicable.",
  ),
  rush_touchdown: boolZ1N.describe(
    "Tri-state: 1 if a rushing touchdown was scored, 0 otherwise, null when not applicable.",
  ),
  return_touchdown: boolZ1N.describe(
    "Tri-state: 1 if a return touchdown was scored (punt, kickoff, interception, or fumble return), 0 otherwise, null when not applicable.",
  ),
  extra_point_attempt: boolZ1N.describe(
    "Tri-state: 1 if an extra point attempt occurred, 0 otherwise, null when not applicable.",
  ),
  two_point_attempt: boolZ1N.describe(
    "Tri-state: 1 if a two-point conversion attempt occurred, 0 otherwise, null when not applicable.",
  ),
  field_goal_attempt: boolZ1N.describe(
    "Tri-state: 1 if a field goal attempt occurred, 0 otherwise, null when not applicable.",
  ),
  kickoff_attempt: boolZ1N.describe(
    "Tri-state: 1 if a kickoff occurred, 0 otherwise, null when not applicable.",
  ),
  punt_attempt: boolZ1N.describe(
    "Tri-state: 1 if a punt occurred, 0 otherwise, null when not applicable.",
  ),
  fumble: boolZ1N.describe(
    "Tri-state: 1 if a fumble occurred on the play, 0 otherwise, null when not applicable.",
  ),
  complete_pass: boolZ1N.describe(
    "Tri-state: 1 if the pass was completed, 0 otherwise, null when not applicable.",
  ),
  assist_tackle: boolZ1N.describe(
    "Tri-state: 1 if an assisted tackle was recorded (see assist_tackle_1-4 columns), 0 otherwise, null when not applicable.",
  ),
  lateral_reception: boolZ1N.describe(
    "Tri-state: 1 if a lateral reception occurred, 0 otherwise, null when not applicable.",
  ),
  lateral_rush: boolZ1N.describe(
    "Tri-state: 1 if a lateral rush occurred, 0 otherwise, null when not applicable.",
  ),
  lateral_return: boolZ1N.describe(
    "Tri-state: 1 if a lateral return occurred, 0 otherwise, null when not applicable.",
  ),
  lateral_recovery: boolZ1N.describe(
    "Tri-state: 1 if a lateral fumble recovery occurred, 0 otherwise, null when not applicable.",
  ),
  passer_player_id: nullishString.describe(
    "GSIS player ID of the passer; null on non-pass plays.",
  ),
  passer_player_name: nullishString.describe(
    "Full name of the passer; null on non-pass plays.",
  ),
  passing_yards: nullishFloatTx.describe(
    "Yards gained on the pass attempt; null on non-pass plays.",
  ),
  receiver_player_id: nullishString.describe(
    "GSIS player ID of the receiver who caught the pass; null on incomplete or non-pass plays.",
  ),
  receiver_player_name: nullishString.describe(
    "Full name of the receiver who caught the pass; null on incomplete or non-pass plays.",
  ),
  receiving_yards: nullishFloatTx.describe(
    "Yards gained on the reception; null on incomplete or non-pass plays.",
  ),
  rusher_player_id: nullishString.describe(
    "GSIS player ID of the rusher who carried the ball; null on non-run plays.",
  ),
  rusher_player_name: nullishString.describe(
    "Full name of the rusher who carried the ball; null on non-run plays.",
  ),
  rushing_yards: nullishFloatTx.describe(
    "Yards gained on the rush; null on non-run plays.",
  ),
  lateral_receiver_player_id: nullishString.describe(
    "GSIS player ID of the player who caught the lateral pass; null when not applicable.",
  ),
  lateral_receiver_player_name: nullishString.describe(
    "Full name of the player who caught the lateral pass; null when not applicable.",
  ),
  lateral_receiving_yards: nullishFloatTx.describe(
    "Yards gained on the lateral reception; null when not applicable.",
  ),
  lateral_rusher_player_id: nullishString.describe(
    "GSIS player ID of the player who carried the ball on the lateral rush; null when not applicable.",
  ),
  lateral_rusher_player_name: nullishString.describe(
    "Full name of the player who carried the ball on the lateral rush; null when not applicable.",
  ),
  lateral_rushing_yards: nullishFloatTx.describe(
    "Yards gained on the lateral rush; null when not applicable.",
  ),
  lateral_sack_player_id: nullishString.describe(
    "GSIS player ID of the QB sacked on the lateral pass attempt; null when not applicable.",
  ),
  lateral_sack_player_name: nullishString.describe(
    "Full name of the QB sacked on the lateral pass attempt; null when not applicable.",
  ),
  interception_player_id: nullishString.describe(
    "GSIS player ID of the defensive player who intercepted the pass; null when not applicable.",
  ),
  interception_player_name: nullishString.describe(
    "Full name of the defensive player who intercepted the pass; null when not applicable.",
  ),
  lateral_interception_player_id: nullishString.describe(
    "GSIS player ID of the defensive player who intercepted the lateral pass; null when not applicable.",
  ),
  lateral_interception_player_name: nullishString.describe(
    "Full name of the defensive player who intercepted the lateral pass; null when not applicable.",
  ),
  punt_returner_player_id: nullishString.describe(
    "GSIS player ID of the punt returner; null when not applicable.",
  ),
  punt_returner_player_name: nullishString.describe(
    "Full name of the punt returner; null when not applicable.",
  ),
  lateral_punt_returner_player_id: nullishString.describe(
    "GSIS player ID of the player who returned the lateral after the punt return; null when not applicable.",
  ),
  lateral_punt_returner_player_name: nullishString.describe(
    "Full name of the player who returned the lateral after the punt return; null when not applicable.",
  ),
  kickoff_returner_player_name: nullishString.describe(
    "Full name of the kickoff returner; null when not applicable.",
  ),
  kickoff_returner_player_id: nullishString.describe(
    "GSIS player ID of the kickoff returner; null when not applicable.",
  ),
  lateral_kickoff_returner_player_id: nullishString.describe(
    "GSIS player ID of the player who returned the lateral after the kickoff return; null when not applicable.",
  ),
  lateral_kickoff_returner_player_name: nullishString.describe(
    "Full name of the player who returned the lateral after the kickoff return; null when not applicable.",
  ),
  punter_player_id: nullishString.describe(
    "GSIS player ID of the punter; null when not applicable.",
  ),
  punter_player_name: nullishString.describe(
    "Full name of the punter; null when not applicable.",
  ),
  kicker_player_id: nullishString.describe(
    "GSIS player ID of the kicker (kickoff or field goal); null when not applicable.",
  ),
  kicker_player_name: nullishString.describe(
    "Full name of the kicker (kickoff or field goal); null when not applicable.",
  ),
  own_kickoff_recovery_player_id: nullishString.describe(
    "GSIS player ID of the player who recovered their own team's kickoff; null when not applicable.",
  ),
  own_kickoff_recovery_player_name: nullishString.describe(
    "Full name of the player who recovered their own team's kickoff; null when not applicable.",
  ),
  blocked_player_id: nullishString.describe(
    "GSIS player ID of the player who blocked the kick; null when not applicable.",
  ),
  blocked_player_name: nullishString.describe(
    "Full name of the player who blocked the kick; null when not applicable.",
  ),
  tackle_for_loss_1_player_id: nullishString.describe(
    "GSIS player ID of the first player credited with a tackle for loss; null when not applicable.",
  ),
  tackle_for_loss_1_player_name: nullishString.describe(
    "Full name of the first player credited with a tackle for loss; null when not applicable.",
  ),
  tackle_for_loss_2_player_id: nullishString.describe(
    "GSIS player ID of the second player credited with a tackle for loss; null when not applicable.",
  ),
  tackle_for_loss_2_player_name: nullishString.describe(
    "Full name of the second player credited with a tackle for loss; null when not applicable.",
  ),
  qb_hit_1_player_id: nullishString.describe(
    "GSIS player ID of the first player credited with a QB hit; null when not applicable.",
  ),
  qb_hit_1_player_name: nullishString.describe(
    "Full name of the first player credited with a QB hit; null when not applicable.",
  ),
  qb_hit_2_player_id: nullishString.describe(
    "GSIS player ID of the second player credited with a QB hit; null when not applicable.",
  ),
  qb_hit_2_player_name: nullishString.describe(
    "Full name of the second player credited with a QB hit; null when not applicable.",
  ),
  forced_fumble_player_1_team: nullishString.describe(
    "Team abbreviation of the first player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_1_player_id: nullishString.describe(
    "GSIS player ID of the first player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_1_player_name: nullishString.describe(
    "Full name of the first player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_2_team: nullishString.describe(
    "Team abbreviation of the second player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_2_player_id: nullishString.describe(
    "GSIS player ID of the second player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_2_player_name: nullishString.describe(
    "Full name of the second player who forced the fumble; null when not applicable.",
  ),
  solo_tackle_1_team: nullishString.describe(
    "Team abbreviation of the player credited with the first solo tackle; null when not applicable.",
  ),
  solo_tackle_1_player_id: nullishString.describe(
    "GSIS player ID of the player credited with the first solo tackle; null when not applicable.",
  ),
  solo_tackle_1_player_name: nullishString.describe(
    "Full name of the player credited with the first solo tackle; null when not applicable.",
  ),
  solo_tackle_2_team: nullishString.describe(
    "Team abbreviation of the player credited with the second solo tackle; null when not applicable.",
  ),
  solo_tackle_2_player_id: nullishString.describe(
    "GSIS player ID of the player credited with the second solo tackle; null when not applicable.",
  ),
  solo_tackle_2_player_name: nullishString.describe(
    "Full name of the player credited with the second solo tackle; null when not applicable.",
  ),
  assist_tackle_1_team: nullishString.describe(
    "Team abbreviation of the first player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_1_player_id: nullishString.describe(
    "GSIS player ID of the first player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_1_player_name: nullishString.describe(
    "Full name of the first player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_2_team: nullishString.describe(
    "Team abbreviation of the second player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_2_player_id: nullishString.describe(
    "GSIS player ID of the second player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_2_player_name: nullishString.describe(
    "Full name of the second player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_3_team: nullishString.describe(
    "Team abbreviation of the third player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_3_player_id: nullishString.describe(
    "GSIS player ID of the third player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_3_player_name: nullishString.describe(
    "Full name of the third player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_4_team: nullishString.describe(
    "Team abbreviation of the fourth player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_4_player_id: nullishString.describe(
    "GSIS player ID of the fourth player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_4_player_name: nullishString.describe(
    "Full name of the fourth player credited with an assisted tackle; null when not applicable.",
  ),
  tackle_with_assist: boolZ1N.describe(
    "Tri-state: 1 if a tackle was made with an assist (see tackle_with_assist_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  tackle_with_assist_1_player_id: nullishString.describe(
    "GSIS player ID of the primary tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_1_player_name: nullishString.describe(
    "Full name of the primary tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_1_team: nullishString.describe(
    "Team abbreviation of the primary tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_2_player_id: nullishString.describe(
    "GSIS player ID of the assisting tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_2_player_name: nullishString.describe(
    "Full name of the assisting tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_2_team: nullishString.describe(
    "Team abbreviation of the assisting tackler on a tackle with assist; null when not applicable.",
  ),
  pass_defense_1_player_id: nullishString.describe(
    "GSIS player ID of the first player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  pass_defense_1_player_name: nullishString.describe(
    "Full name of the first player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  pass_defense_2_player_id: nullishString.describe(
    "GSIS player ID of the second player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  pass_defense_2_player_name: nullishString.describe(
    "Full name of the second player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  fumbled_1_team: nullishString.describe(
    "Team abbreviation of the first player who fumbled; null when not applicable.",
  ),
  fumbled_1_player_id: nullishString.describe(
    "GSIS player ID of the first player who fumbled; null when not applicable.",
  ),
  fumbled_1_player_name: nullishString.describe(
    "Full name of the first player who fumbled; null when not applicable.",
  ),
  fumbled_2_player_id: nullishString.describe(
    "GSIS player ID of the second player who fumbled; null when not applicable.",
  ),
  fumbled_2_player_name: nullishString.describe(
    "Full name of the second player who fumbled; null when not applicable.",
  ),
  fumbled_2_team: nullishString.describe(
    "Team abbreviation of the second player who fumbled; null when not applicable.",
  ),
  fumble_recovery_1_team: nullishString.describe(
    "Team abbreviation of the first player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_1_player_id: nullishString.describe(
    "GSIS player ID of the first player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_1_player_name: nullishString.describe(
    "Full name of the first player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_2_team: nullishString.describe(
    "Team abbreviation of the second player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_2_player_id: nullishString.describe(
    "GSIS player ID of the second player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_2_player_name: nullishString.describe(
    "Full name of the second player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_1_yards: nullishFloatTx.describe(
    "Yards gained on the first fumble recovery return; null when not applicable.",
  ),
  fumble_recovery_2_yards: nullishFloatTx.describe(
    "Yards gained on the second fumble recovery return; null when not applicable.",
  ),
  sack_player_id: nullishString.describe(
    "GSIS player ID of the player credited with a full sack; null when not applicable.",
  ),
  sack_player_name: nullishString.describe(
    "Full name of the player credited with a full sack; null when not applicable.",
  ),
  half_sack_1_player_id: nullishString.describe(
    "GSIS player ID of the first player credited with a half sack; null when not applicable.",
  ),
  half_sack_1_player_name: nullishString.describe(
    "Full name of the first player credited with a half sack; null when not applicable.",
  ),
  half_sack_2_player_id: nullishString.describe(
    "GSIS player ID of the second player credited with a half sack; null when not applicable.",
  ),
  half_sack_2_player_name: nullishString.describe(
    "Full name of the second player credited with a half sack; null when not applicable.",
  ),
  return_team: nullishString.describe(
    "Team abbreviation of the team returning the kick or punt; null when not applicable.",
  ),
  return_yards: nullishFloatTx.describe(
    "Yards gained on the return; null when not applicable.",
  ),
  penalty_team: nullishString.describe(
    "Team abbreviation of the team penalized on the play; null if no penalty.",
  ),
  penalty_player_id: nullishString.describe(
    "GSIS player ID of the penalized player; null if no penalty or if the penalty was on the team/bench.",
  ),
  penalty_player_name: nullishString.describe(
    "Full name of the penalized player; null if no penalty or if the penalty was on the team/bench.",
  ),
  penalty_yards: nullishFloatTx.describe(
    "Yards assessed for the penalty; null if no penalty.",
  ),
  replay_or_challenge: boolZ1N.describe(
    "Tri-state: 1 if a replay review or coach's challenge occurred on the play, 0 otherwise, null when not applicable.",
  ),
  replay_or_challenge_result: nullishStringSub(
    z.enum(["reversed", "upheld", "denied"]),
  ).describe(
    "Result of the replay review or challenge: reversed, upheld, or denied; null if no review occurred.",
  ),
  penalty_type: z.pipe(
    nullishString,
    z.union([
      z.null(),
      z.enum([
        "Unnecessary Roughness",
        "Defensive Pass Interference",
        "Face Mask",
        "False Start",
        "Defensive Holding",
        "Roughing the Passer",
        "Kickoff Short of Landing Zone",
        "Offensive Holding",
        "Defensive Too Many Men on Field",
        "Kickoff Out of Bounds",
        "Illegal Formation",
        "Horse Collar Tackle",
        "Offensive Pass Interference",
        "Delay of Game",
        "Defensive Offside",
        "Kick Catch Interference",
        "Ineligible Downfield Pass",
        "Illegal Contact",
        "Illegal Shift",
        "Illegal Block Above the Waist",
        "Player Out of Bounds on Kick",
        "Neutral Zone Infraction",
        "Encroachment",
        "Illegal Use of Hands",
        "Offensive Too Many Men on Field",
        "Illegal Substitution",
        "Illegal Touch Pass",
        "Unsportsmanlike Conduct",
        "Intentional Grounding",
        "Fair Catch Interference",
        "Taunting",
        "Illegal Forward Pass",
        "Defensive Delay of Game",
        "Roughing the Kicker",
        "Illegal Motion",
        "Illegal Kick/Kicking Loose Ball",
        "Leverage",
        "Ineligible Downfield Kick",
        "Chop Block",
        "Illegal Blindside Block",
        "Illegal Touch Kick",
        "Clipping",
        "Low Block",
        "Offensive Offside",
        "Lowering the Head to Make Forcible Contact",
        "Tripping",
        "Disqualification",
        "Running Into the Kicker",
        "Illegal Bat",
        "Illegal Crackback",
        "Hip Drop Tackle",
        "Offensive 12 On-field",
        "Personal Foul",
        "Player Out of Bounds on Punt",
        "Defensive 12 On-field",
        "Offside on Free Kick",
        "Illegal Wedge",
        "Illegal Kick",
        "Interference with Opportunity to Catch",
        "Illegal Peelback",
        "Leaping",
        "Invalid Fair Catch Signal",
        "Face Mask (5 Yards)",
        "Illegal Procedure",
        "Illegal Receiver Pass",
        "Illegal Cut",
        "Short Free Kick",
        "Illegally Kicking Ball",
        "Delay of Kickoff",
        "Illegal Scrimmage Kick",
        "Lowering the Head to Initiate Contact",
        "Illegal Double-Team Block",
        "Horse Collar",
      ]),
      z.string(),
    ]),
  ).describe(
    "Type of penalty called on the play, e.g. 'Offensive Holding', 'False Start', 'Defensive Pass Interference', 'Roughing the Passer', 'Unnecessary Roughness' (free-form string beyond the enumerated values); null if no penalty.",
  ),
  defensive_two_point_attempt: boolZ1N.describe(
    "Tri-state: 1 if the defense attempted a defensive two-point conversion (e.g. returning an interception or fumble on a conversion attempt), 0 otherwise, null when not applicable.",
  ),
  defensive_two_point_conv: boolZ1N.describe(
    "Tri-state: 1 if the defense converted a defensive two-point conversion, 0 otherwise, null when not applicable.",
  ),
  defensive_extra_point_attempt: boolZ1N.describe(
    "Tri-state: 1 if the defense attempted a defensive extra point (e.g. returning a blocked extra point), 0 otherwise, null when not applicable.",
  ),
  defensive_extra_point_conv: boolZ1N.describe(
    "Tri-state: 1 if the defense converted a defensive extra point, 0 otherwise, null when not applicable.",
  ),
  safety_player_name: nullishString.describe(
    "Full name of the player tackled or sacked in the end zone for the safety; null if no safety.",
  ),
  safety_player_id: nullishString.describe(
    "GSIS player ID of the player tackled or sacked in the end zone for the safety; null if no safety.",
  ),
  season: z.coerce
    .number()
    .int()
    .describe("Season year (e.g. 2024)."),
  cp: nullishFloatTx.describe(
    "Completion probability (0-1) of the pass attempt (nflfastR model); null on non-pass plays.",
  ),
  cpoe: nullishFloatTx.describe(
    "Completion percentage over expected for the pass attempt (nflfastR model); null on non-pass plays.",
  ),
  series: z.coerce
    .number()
    .describe("Series number within the game (nflfastR drive subdivision)."),
  series_success: boolZ1.describe(
    "1 if the series was successful (first down or touchdown), 0 otherwise.",
  ),
  series_result: nullishStringSub(
    z.enum([
      "First down",
      "Touchdown",
      "Turnover",
      "Field goal",
      "QB kneel",
      "Punt",
      "Turnover on downs",
      "Missed field goal",
      "End of half",
      "Opp touchdown",
      "Safety",
    ]),
  ).describe(
    "Result of the series: First down, Touchdown, Turnover, Field goal, QB kneel, Punt, Turnover on downs, Missed field goal, End of half, Opp touchdown, or Safety.",
  ),
  order_sequence: nullishFloatTx.describe(
    "Order sequence number of the play, used for ordering plays within a game; null when unavailable.",
  ),
  start_time: nullishString.describe(
    "Wall-clock timestamp of the play in a non-ISO format: 'M/d/YY, HH:mm:ss' (e.g. '9/8/24, 13:03:02'); null when unavailable.",
  ),
  time_of_day: nullishString.describe(
    "Time of day of the play (HH:MM:SS); null when unavailable.",
  ),
  stadium: nullishString.describe(
    "Name of the stadium where the game was played; null when unavailable.",
  ),
  weather: nullishString.describe(
    "Weather conditions at the game (e.g. 'Clear', 'Rain'); null when unavailable.",
  ),
  nfl_api_id: nullishString.describe(
    "UUID play identifier from the NFL's internal API feed; null when unavailable.",
  ),
  play_clock: nullishString.describe(
    "Play clock value at the snap (seconds, as string); the feed currently only populates '0' or null.",
  ),
  play_deleted: boolZ1N.describe(
    "Tri-state: 1 if the play was deleted in the NFL feed (e.g. penalized no-play), 0 otherwise, null when unknown.",
  ),
  play_type_nfl: nullishStringSub(
    z.enum([
      "GAME_START",
      "KICK_OFF",
      "RUSH",
      "PASS",
      "SACK",
      "XP_KICK",
      "END_QUARTER",
      "FIELD_GOAL",
      "PENALTY",
      "TIMEOUT",
      "PUNT",
      "PAT2",
      "END_GAME",
      "INTERCEPTION",
      "UNSPECIFIED",
      "COMMENT",
      "FUMBLE_RECOVERED_BY_OPPONENT",
      "FREE_KICK",
    ]),
  ).describe(
    "NFL feed play type: GAME_START, KICK_OFF, RUSH, PASS, SACK, XP_KICK, END_QUARTER, FIELD_GOAL, PENALTY, TIMEOUT, PUNT, PAT2, END_GAME, INTERCEPTION, UNSPECIFIED, COMMENT, FUMBLE_RECOVERED_BY_OPPONENT, or FREE_KICK; null when unavailable.",
  ),
  special_teams_play: boolZ1N.describe(
    "Tri-state: 1 if the play was a special teams play, 0 otherwise, null when not applicable.",
  ),
  st_play_type: nullishStringSub(
    z.enum([
      "PENALTY",
    ]),
  ).describe(
    "Special teams play type from the NFL feed. Currently only PENALTY is ever populated; the feed does not populate other special teams play types.",
  ),
  end_clock_time: nullishString.describe(
    "Game clock at the end of the play (MM:SS); null when unavailable.",
  ),
  end_yard_line: nullishString.describe(
    "Yard line at the end of the play, formatted 'TEAM YARDLINE' (e.g. 'ARI 40') or '50' at midfield; null when unavailable.",
  ),
  fixed_drive: z.coerce.number().describe(
    "Drive number as computed by the nflfastR 'fixed drive' logic (1-indexed).",
  ),
  fixed_drive_result: z
    .pipe(
      z.coerce.string(),
      z.enum([
        "Touchdown",
        "Turnover",
        "Field goal",
        "End of half",
        "Punt",
        "Turnover on downs",
        "Missed field goal",
        "Opp touchdown",
        "Safety",
      ]),
    )
    .describe(
      "Result of the fixed drive: Touchdown, Turnover, Field goal, End of half, Punt, Turnover on downs, Missed field goal, Opp touchdown, or Safety.",
    ),
  drive_start_real_time: nullishString.describe(
    "Time of day when the drive started (HH:MM:SS); null when unavailable.",
  ),
  drive_play_count: nullishFloatTx.describe(
    "Number of plays in the drive (1-indexed); null when unavailable.",
  ),
  drive_time_of_possession: nullishString.describe(
    "Time of possession of the drive as a clock string MM:SS (e.g. '6:00'); null when unavailable.",
  ),
  drive_first_downs: nullishFloatTx.describe(
    "Number of first downs earned during the drive; null when unavailable.",
  ),
  drive_inside20: boolZ1N.describe(
    "Tri-state: 1 if the drive entered the red zone (inside the 20-yard line), 0 otherwise, null when not applicable.",
  ),
  drive_ended_with_score: boolZ1N.describe(
    "Tri-state: 1 if the drive ended with a score, 0 otherwise, null when not applicable.",
  ),
  drive_quarter_start: nullishFloatTx.describe(
    "Quarter in which the drive started; null when unavailable.",
  ),
  drive_quarter_end: nullishFloatTx.describe(
    "Quarter in which the drive ended; null when unavailable.",
  ),
  drive_yards_penalized: nullishFloatTx.describe(
    "Yards gained from penalties by the drive team during the drive; null when unavailable.",
  ),
  drive_start_transtion: nullishStringSub(
    z.enum([
      "KICKOFF",
      "FUMBLE",
      "PUNT",
      "DOWNS",
      "MISSED_FG",
      "INTERCEPTION",
      "MUFFED_PUNT",
      "BLOCKED_PUNT",
      "MUFFED_KICKOFF",
      "ONSIDE_KICK",
      "BLOCKED_FG,_DOWNS",
      "BLOCKED_PUNT,_DOWNS",
      "BLOCKED_FG",
      "UNKNOWN",
      "OWN_KICKOFF",
      "Punt",
      "Touchdown",
      "Interception",
      "Fumble",
      "Field Goal",
      "Blocked FG",
      "End of Half",
      "Missed FG",
      "Safety",
      "Downs",
      "Fumble, Safety",
      "Blocked Punt",
      "Blocked Punt, Downs",
      "Blocked FG, Downs",
      "BLOCKED_PUNT_DOWNS",
      "BLOCKED_FG_DOWNS",
      "MUFFED_FG",
    ]),
  ).describe(
    "How the drive started: KICKOFF, FUMBLE, PUNT, DOWNS, MISSED_FG, INTERCEPTION, MUFFED_PUNT, BLOCKED_PUNT, MUFFED_KICKOFF, ONSIDE_KICK, BLOCKED_FG, BLOCKED_FG,_DOWNS, BLOCKED_PUNT,_DOWNS, UNKNOWN, OWN_KICKOFF, plus equivalent mixed-case variants from older feed formats (e.g. 'Punt', 'Blocked FG', 'Fumble, Safety', 'BLOCKED_PUNT_DOWNS', 'BLOCKED_FG_DOWNS', 'MUFFED_FG'); null when unavailable. Note: field name in the feed is misspelled 'transtion'.",
  ),
  drive_end_transition: nullishStringSub(
    z.enum([
      "TOUCHDOWN",
      "FUMBLE",
      "FIELD_GOAL",
      "END_HALF",
      "PUNT",
      "DOWNS",
      "END_GAME",
      "MISSED_FG",
      "INTERCEPTION",
      "SAFETY",
      "BLOCKED_PUNT",
      "BLOCKED_FG",
      "BLOCKED_FG,_DOWNS",
      "BLOCKED_PUNT,_DOWNS",
      "FUMBLE,_SAFETY",
      "UNKNOWN",
      "Punt",
      "Touchdown",
      "Interception",
      "Fumble",
      "Field Goal",
      "Blocked FG",
      "End of Game",
      "End of Half",
      "Missed FG",
      "Safety",
      "Downs",
      "Fumble, Safety",
      "Blocked Punt",
      "Blocked Punt, Downs",
      "Blocked FG, Downs",
      "BLOCKED_PUNT_DOWNS",
      "FUMBLE_SAFETY",
      "BLOCKED_FG_DOWNS",
      "BLOCKED_PUNT,_SAFETY",
    ]),
  ).describe(
    "How the drive ended: TOUCHDOWN, FUMBLE, FIELD_GOAL, END_HALF, PUNT, DOWNS, END_GAME, MISSED_FG, INTERCEPTION, SAFETY, BLOCKED_PUNT, BLOCKED_FG, BLOCKED_FG,_DOWNS, BLOCKED_PUNT,_DOWNS, FUMBLE,_SAFETY, BLOCKED_PUNT,_SAFETY (a drive ending with a blocked punt that resulted in a safety), UNKNOWN, plus equivalent mixed-case variants from older feed formats (e.g. 'Punt', 'Blocked Punt, Downs', 'FUMBLE_SAFETY', 'BLOCKED_PUNT_DOWNS'); null when unavailable.",
  ),
  drive_game_clock_start: nullishString.describe(
    "Game clock at the start of the drive as string MM:SS (e.g. '15:00'); null when unavailable.",
  ),
  drive_game_clock_end: nullishString.describe(
    "Game clock at the end of the drive as string MM:SS; null when unavailable.",
  ),
  drive_start_yard_line: nullishString.describe(
    "Yard line where the drive started (e.g. 'ARI 40' or '50'); null when unavailable.",
  ),
  drive_end_yard_line: nullishString.describe(
    "Yard line where the drive ended (e.g. 'ARI 40' or '50'); null when unavailable.",
  ),
  drive_play_id_started: nullishString.describe(
    "play_id of the first play of the drive; null when unavailable.",
  ),
  drive_play_id_ended: nullishString.describe(
    "play_id of the last play of the drive; null when unavailable.",
  ),
  away_score: z.coerce.number().describe(
    "Away team's final score for the game.",
  ),
  home_score: z.coerce.number().describe(
    "Home team's final score for the game.",
  ),
  location: z
    .pipe(z.coerce.string(), z.enum(["Home", "Neutral"]))
    .describe(
      "Game location: Home = played at the home team's stadium, Neutral = neutral site.",
    ),
  result: z.coerce.number().describe(
    "Margin of victory from the home team's perspective (home score minus away score; positive = home win).",
  ),
  total: z.coerce.number().describe(
    "Total points scored in the game (home + away).",
  ),
  spread_line: z.coerce.number().describe(
    "Closing Vegas spread line (home team perspective).",
  ),
  total_line: z.coerce.number().describe(
    "Closing Vegas over/under total line.",
  ),
  div_game: boolZ1.describe(
    "1 if the game was a divisional matchup, 0 otherwise.",
  ),
  roof: z
    .pipe(z.coerce.string(), z.enum(["outdoors", "dome", "closed", "open"]))
    .describe(
      "Stadium roof type: outdoors, dome, closed (retractable roof closed), or open (retractable roof open).",
    ),
  surface: nullishStringSub(
    z.enum([
      "a_turf",
      "grass",
      "sportturf",
      "fieldturf",
      "matrixturf",
      "astroturf",
      "astroplay",
      "dessograss",
      "grass ",
    ]),
  ).describe(
    "Stadium playing surface: a_turf (artificial turf), grass, sportturf, fieldturf, matrixturf, astroturf, astroplay (legacy AstroTurf surface), dessograss (Desso GrassMaster hybrid), or 'grass ' (legacy value with trailing space); null when unavailable.",
  ),
  temp: nullishFloatTx.describe(
    "Temperature in degrees Fahrenheit at kickoff; null when unavailable.",
  ),
  wind: nullishFloatTx.describe(
    "Wind speed in miles per hour at kickoff; null when unavailable.",
  ),
  hoam_coach: z.coerce.string().describe(
    "Full name of the home team's head coach. Note: field name is misspelled 'hoam' (home) in the feed.",
  ),
  away_coach: z.coerce.string().describe(
    "Full name of the away team's head coach.",
  ),
  stadium_id: z.coerce.string().describe(
    "nflverse stadium identifier.",
  ),
  game_stadium: z.coerce.string().describe(
    "Stadium name for the game (from schedule data).",
  ),
  aborted_play: boolZ1.describe(
    "1 if the play was aborted (e.g. blown dead before the snap), 0 otherwise.",
  ),
  success: boolZ1N.describe(
    "Tri-state: 1 if the play was successful (nflfastR success definition, based on positive EPA), 0 otherwise, null when not applicable.",
  ),
  passer: nullishString.describe(
    "Full name of the passer (denormalized duplicate of passer_player_name); null on non-pass plays.",
  ),
  passer_jersey_number: nullishString.describe(
    "Jersey number of the passer; null on non-pass plays.",
  ),
  rusher: nullishString.describe(
    "Full name of the rusher (denormalized duplicate of rusher_player_name); null on non-run plays.",
  ),
  rusher_jersey_number: nullishString.describe(
    "Jersey number of the rusher; null on non-run plays.",
  ),
  receiver: nullishString.describe(
    "Full name of the receiver (denormalized duplicate of receiver_player_name); null when no reception.",
  ),
  receiver_jersey_number: nullishString.describe(
    "Jersey number of the receiver; null when no reception.",
  ),
  pass: boolZ1.describe(
    "1 if the play was a pass play (dropback with a pass attempt), 0 otherwise.",
  ),
  rush: boolZ1.describe(
    "1 if the play was a rush attempt, 0 otherwise.",
  ),
  first_down: boolZ1N.describe(
    "Tri-state: 1 if the play earned a first down, 0 otherwise, null when not applicable.",
  ),
  special: boolZ1.describe(
    "1 if the play was a special teams play, 0 otherwise.",
  ),
  play: boolZ1.describe(
    "1 if a real football play occurred (excludes administrative events like end of quarter, timeouts, and penalty-only plays), 0 otherwise.",
  ),
  passer_id: nullishString.describe(
    "GSIS player ID of the passer (denormalized duplicate of passer_player_id); null on non-pass plays.",
  ),
  rusher_id: nullishString.describe(
    "GSIS player ID of the rusher (denormalized duplicate of rusher_player_id); null on non-run plays.",
  ),
  receiver_id: nullishString.describe(
    "GSIS player ID of the receiver (denormalized duplicate of receiver_player_id); null when no reception.",
  ),
  name: nullishString.describe(
    "Name of the primary player who made the play (denormalized); null when unavailable.",
  ),
  jersey_number: nullishString.describe(
    "Jersey number of the primary player who made the play; null when unavailable.",
  ),
  id: nullishString.describe(
    "GSIS player ID of the primary player who made the play. NOTE: this is a player ID, not the play ID; null when unavailable.",
  ),
  fantasy_player_name: nullishString.describe(
    "Fantasy player name (short format, e.g. 'A.Rodgers') for the primary player; null when unavailable.",
  ),
  fantasy_palyer_id: nullishString.describe(
    "Fantasy player ID for the primary player. Note: field name is misspelled 'palyer' (player) in the feed; null when unavailable.",
  ),
  fantasy: nullishString.describe(
    "Fantasy player name (duplicate of fantasy_player_name); null when unavailable.",
  ),
  fantasy_id: nullishString.describe(
    "Fantasy player ID (duplicate of fantasy_palyer_id); null when unavailable.",
  ),
  out_of_bounds: boolZ1.describe(
    "1 if the play went out of bounds, 0 otherwise.",
  ),
  home_opening_kickoff: boolZ1.describe(
    "1 if the home team received the opening kickoff, 0 otherwise.",
  ),
  qb_epa: nullishFloatTx.describe(
    "EPA on plays with a QB dropback (nflfastR); null on non-dropback plays.",
  ),
  xyac_epa: nullishFloatTx.describe(
    "EPA attributed to expected yards after catch (nflfastR xYAC model); null on non-pass plays.",
  ),
  xyac_mean_yardage: nullishFloatTx.describe(
    "Mean expected yards after catch for the completion (nflfastR xYAC model); null on non-completions.",
  ),
  xyac_median_yardage: nullishFloatTx.describe(
    "Median expected yards after catch for the completion (nflfastR xYAC model); null on non-completions.",
  ),
  xyac_success: nullishFloatTx.describe(
    "Probability (0-1) that the completion earns positive EPA on the remaining yards after catch (nflfastR xYAC model); null on non-completions.",
  ),
  xyac_fd: nullishFloatTx.describe(
    "Probability (0-1) that the completion earns a first down on the remaining yards after catch (nflfastR xYAC model); null on non-completions.",
  ),
  xpass: nullishFloatTx.describe(
    "Probability (0-1) that the play is a pass, estimated from game state (nflfastR model); null when unavailable.",
  ),
  pass_oe: nullishFloatTx.describe(
    "Pass rate over expected: actual pass (1 or 0) minus xpass probability for the play (nflfastR model); null when unavailable.",
  ),
});

const ngsBaseSchema = z.object({
  season: z.coerce.number().int().describe("Season year (e.g. 2024)"),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["REG", "POST"]))
    .describe("Season type: REG = regular season, POST = postseason"),
  week: z.coerce.number().int().describe("Week number within the season"),
  player_display_name: z.coerce.string().describe("Player's full display name as shown in the feed"),
  player_position: z
    .pipe(z.coerce.string(), z.enum(["QB", "RB", "FB", "HB", "WR", "TE"]))
    .describe("Player's position: QB, RB, FB, HB, WR, or TE"),
  team_abbr: nullishString.describe("Team abbreviation; null when the player is not currently on a team"),
  player_gsis_id: z.coerce.string().describe("Player's unique NFL GSIS identifier"),
  player_first_name: z.coerce.string().describe("Player's first name"),
  player_last_name: z.coerce.string().describe("Player's last name"),
  player_jersey_number: z.coerce.string().describe("Player's jersey number as a string"),
  player_short_name: nullishString.describe("Player's short name (e.g. 'A.Rodgers'); null if unavailable"),
});

const ngsPassingSchema = ngsBaseSchema.extend({
  avg_time_to_throw: z.coerce.number().describe("Average time from snap to throw in seconds"),
  avg_completed_air_yards: z.coerce.number().describe("Average air yards on completed passes"),
  avg_intended_air_yards: z.coerce.number().describe(
    "Average intended air yards (air yards to the intended receiver) across all attempts",
  ),
  avg_air_yards_differential: z.coerce.number().describe(
    "Average air yards differential: completed air yards minus intended air yards",
  ),
  aggressiveness: z.coerce.number().describe(
    "Aggressiveness: share of pass attempts thrown into tight windows (receiver within 1 yard of the nearest defender)",
  ),
  max_completed_air_distance: nullishFloatTx.describe(
    "Longest completed pass by air distance in yards; null if unavailable",
  ),
  avg_air_yards_to_sticks: z.coerce.number().describe("Average air yards to the first-down sticks at the time of the throw"),
  attempts: z.coerce.number().describe("Number of pass attempts"),
  pass_yards: z.coerce.number().describe("Total passing yards"),
  pass_touchdowns: z.coerce.number().describe("Number of passing touchdowns"),
  interceptions: z.coerce.number().describe("Number of interceptions thrown"),
  passer_rating: z.coerce.number().describe("NFL passer rating"),
  completions: z.coerce.number().describe("Number of completed passes"),
  completion_percentage: z.coerce.number().describe("Completion percentage (0-100)"),
  expected_completion_percentage: nullishFloatTx.describe(
    "Model-predicted completion percentage (0-100); null if unavailable",
  ),
  completion_percentage_above_expectation: nullishFloatTx.describe(
    "Completion percentage above expectation: actual minus expected, in percentage points; null if unavailable",
  ),
  avg_air_distance: nullishFloatTx.describe("Average air distance of pass attempts in yards; null if unavailable"),
  max_air_distance: nullishFloatTx.describe("Longest air distance of a pass attempt in yards; null if unavailable"),
});

const ngsReceivingSchema = ngsBaseSchema.extend({
  avg_cushion: nullishFloatTx.describe("Average cushion in yards between the receiver and the nearest defender at the snap; null if unavailable"),
  avg_separation: z.coerce.number().describe(
    "Average separation in yards between the receiver and the nearest defender at pass arrival",
  ),
  avg_intended_air_yards: z.coerce.number().describe("Average intended air yards per target"),
  percent_share_of_intended_air_yards: z.coerce.number().describe(
    "Player's share of the team's intended air yards as a percentage (0-100)",
  ),
  receptions: z.coerce.number().describe("Number of receptions"),
  targets: z.coerce.number().describe("Number of targets"),
  catch_percentage: z.coerce.number().describe("Catch percentage: receptions divided by targets (0-100)"),
  yards: nullishFloatTx.describe("Total receiving yards; null if unavailable"),
  rec_touchdowns: z.coerce.number().describe("Number of receiving touchdowns"),
  avg_yac: nullishFloatTx.describe("Average yards after catch; null if unavailable"),
  avg_expected_yac: nullishFloatTx.describe("Average expected yards after catch based on the NGS model; null if unavailable"),
  avg_yac_above_expectation: nullishFloatTx.describe(
    "Average yards after catch above expectation: actual minus expected; null if unavailable",
  ),
});

const ngsRushingSchema = ngsBaseSchema.extend({
  efficiency: z.coerce.number().describe("Rush efficiency: actual rush yards over expected rush yards per attempt"),
  percent_attempts_gte_eight_defenders: z.coerce.number().describe(
    "Share of rush attempts against 8 or more defenders in the box, as a percentage (0-100)",
  ),
  avg_time_to_los: z.coerce.number().describe("Average time from snap to crossing the line of scrimmage in seconds"),
  rush_attempts: z.coerce.number().describe("Number of rush attempts"),
  rush_yards: z.coerce.number().describe("Total rushing yards"),
  avg_rush_yards: z.coerce.number().describe("Average rush yards per attempt"),
  rush_touchdowns: z.coerce.number().describe("Number of rushing touchdowns"),
  expected_rush_yards: nullishFloatTx.describe("Model-predicted expected rush yards; null if unavailable"),
  rush_yards_over_expected: nullishFloatTx.describe("Rush yards over expected: actual minus expected; null if unavailable"),
  rush_yards_over_expected_per_att: nullishFloatTx.describe("Rush yards over expected per attempt; null if unavailable"),
  rush_pct_over_expected: nullishFloatTx.describe(
    "Share of rush attempts that gained more yards than expected, as a percentage; null if unavailable",
  ),
});

const injuriesSchema = z.object({
  season: z.coerce.number().int().describe("Season year (e.g. 2024)"),
  game_type: z
    .pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"]))
    .describe("Game type: REG = regular season, WC = wild card, DIV = divisional round, CON = conference championship, SB = Super Bowl"),
  team: z.coerce.string().describe("Team abbreviation"),
  week: z.coerce.number().describe("Week number within the season"),
  gsis_id: z.coerce.string().describe("Player's unique NFL GSIS identifier"),
  position: nullishStringSub(
    z.enum([
      "DE",
      "G",
      "QB",
      "LB",
      "DT",
      "T",
      "WR",
      "CB",
      "S",
      "FB",
      "TE",
      "K",
      "RB",
      "C",
      "P",
      "LS",
      "KR",
      "PR",
    ]),
  ).describe("Player's position abbreviation (e.g. QB, WR, LS); null if unavailable"),
  full_name: z.coerce.string().describe("Player's full name"),
  first_name: z.coerce.string().describe("Player's first name"),
  last_name: z.coerce.string().describe("Player's last name"),
  report_primary_injury: nullishString.describe("Primary injury listed on the official game report; null if none"),
  report_secondary_injury: nullishString.describe("Secondary injury listed on the official game report; null if none"),
  report_status: nullishStringSub(z.enum(["Out", "Questionable", "Doubtful", "Probable", "Note"])).describe(
    "Game-day status from the official injury report: Out, Questionable, Doubtful, Probable, or Note; null if none",
  ),
  practice_primary_injury: nullishString.describe("Primary injury listed on the practice report; null if none"),
  practice_secondary_injury: nullishString.describe("Secondary injury listed on the practice report; null if none"),
  practice_status: nullishStringSub(
    z.enum([
      "Did Not Participate In Practice",
      "Limited Participation in Practice",
      "Full Participation in Practice",
      "Out (Definitely Will Not Play)",
      "Note",
    ]),
  ).describe(
    "Practice participation status: 'Did Not Participate In Practice', 'Limited Participation in Practice', 'Full Participation in Practice', 'Out (Definitely Will Not Play)', or 'Note'; null if none",
  ),
  date_modified: nullishFloatTx.describe("Last modification time as a millisecond Unix timestamp; null if unavailable"),
});

const depthChartsSchema = z.object({
  season: z.coerce.number().int().describe("Season year (e.g. 2024)"),
  club_code: z.coerce.string().describe("Team abbreviation (club code)"),
  week: nullishIntTx.describe("Week number within the season; null when not applicable"),
  game_type: z
    .pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SBBYE", "SB"]))
    .describe(
      "Game type: REG = regular season, WC = wild card, DIV = divisional round, CON = conference championship, SBBYE = Super Bowl bye week, SB = Super Bowl",
    ),
  depth_team: z.coerce.string().describe("Team name this depth-chart row belongs to"),
  last_name: z.coerce.string().describe("Player's last name"),
  first_name: z.coerce.string().describe("Player's first name"),
  football_name: z.coerce.string().describe("Player's football name as listed on the depth chart"),
  formation: z
    .pipe(z.coerce.string(), z.enum(["Defense", "Special Teams", "Offense"]))
    .describe("Which side of the ball this depth-chart row is for: Defense, Special Teams, or Offense"),
  gsis_id: nullishString.describe("Player's unique NFL GSIS identifier; null if unavailable"),
  jersey_number: nullishString.describe("Player's jersey number as a string; null if unavailable"),
  position: z.pipe(
    z.coerce.string(),
    z.enum([
      "ILB",
      "CB",
      "SS",
      "K",
      "P",
      "WR",
      "DE",
      "LS",
      "C",
      "TE",
      "FB",
      "RB",
      "QB",
      "DT",
      "OLB",
      "FS",
      "T",
      "G",
      "MLB",
      "NT",
      "DB",
      "LB",
      "S",
      "PR",
      "UK",
      "KR",
    ]),
  ).describe("Normalized position from the enum (e.g. QB, WR, NT); UK = unknown"),
  elias_id: nullishString.describe("Player's Elias Sports Bureau identifier; null if unavailable"),
  depth_position: nullishString.describe(
    "Free-form depth-chart position label as printed on the chart (e.g. 'LWR', 'RDE'); distinct from the normalized position field",
  ),
  full_name: z.coerce.string().describe("Player's full name"),
});

const combineSchema = z.object({
  season: z.coerce.number().int().describe("Season year (e.g. 2024)"),
  draft_year: nullishFloatTx.describe("Year the player was drafted; null if undrafted"),
  draft_team: nullishString.describe("Full team name of the team that drafted the player; null if undrafted"),
  draft_round: nullishFloatTx.describe("Round in which the player was drafted; null if undrafted"),
  draft_ovr: nullishFloatTx.describe("Overall pick number at which the player was drafted; null if undrafted"),
  pfr_id: nullishString.describe("Player's Pro-Football-Reference identifier; null if unavailable"),
  cfb_id: nullishString.describe("Player's College Football identifier; null if unavailable"),
  player_name: z.coerce.string().describe("Player's full name"),
  pos: z.coerce.string().describe(
    "Player's position from the combine feed; may be free-form since dual-position players are listed with multiple positions (e.g. 'CB/WR')",
  ),
  school: z.coerce.string().describe("College the player attended at the time of the combine"),
  ht: nullishString.describe("Height as a feet-inches string (e.g. '5-5'); null if unavailable"),
  wt: nullishFloatTx.describe("Weight in pounds (lbs); null if unavailable"),
  forty: nullishFloatTx.describe("40-yard dash time in seconds; null if unavailable"),
  bench: nullishFloatTx.describe(
    "Bench press result from the combine feed (number of reps; units ambiguous in the feed); null if unavailable",
  ),
  vertical: nullishFloatTx.describe("Vertical jump height in inches; null if unavailable"),
  broad_jump: nullishFloatTx.describe("Broad jump distance in inches; null if unavailable"),
  cone: nullishFloatTx.describe("3-cone drill time in seconds; null if unavailable"),
  shuttle: nullishFloatTx.describe("20-yard shuttle time in seconds; null if unavailable"),
});

export const NFLVERSE_TAG_SCHEMA = {
  // release tag -> schema (single-asset tags map directly; multi-asset tags map
  // asset base name -> schema, matching the bases produced by RELEASE_MAP)
  trades: tradeSchema,
  teams: teamsSchema,
  schedules: gamesSchema,
  stats_team: {
    stats_team_week: teamStatsSchemaWeek,
    stats_team_reg: teamStatsSchemaSeason,
    stats_team_regpost: teamStatsSchemaSeason,
    stats_team_post: teamStatsSchemaSeason,
  },
  stats_player: {
    stats_player_week: playerStatsSchemaWeek,
    stats_player_reg: playerStatsSchemaSeason,
    stats_player_regpost: playerStatsSchemaSeason,
    stats_player_post: playerStatsSchemaSeason,
  },
  ftn_charting: ftnChartingSchema,
  espn_data: {
    qbr_season_level: espnQbrSeasonalSchema,
    qbr_week_level: espnQbrWeeklySchema,
  },
  weekly_rosters: rosterWeeklySchema,
  players: playerSchema,
  officials: officialsSchema,
  draft_picks: draftPicksSchema,
  contracts: histContractsSchema,
  snap_counts: snapCountSchema,
  rosters: rostersSchema,
  pfr_advstats: {
    advstats_week_def: pfrAdvStats_wkDef_schema,
    advstats_week_pass: pfrAdvStats_wkPass_schema,
    advstats_week_rec: pfrAdvStats_wkRec_schema,
    advstats_week_rush: pfrAdvStats_wkRush_schema,
    advstats_season_def: pfrAdvStats_sznDef_schema,
    advstats_season_pass: pfrAdvStats_sznPass_schema,
    advstats_season_rec: pfrAdvStats_sznRec_schema,
    advstats_season_rush: pfrAdvStats_sznRush_schema,
  },
  pbp: pbpSchema,
  nextgen_stats: {
    ngs_passing: ngsPassingSchema,
    ngs_receiving: ngsReceivingSchema,
    ngs_rushing: ngsRushingSchema,
  },
  injuries: injuriesSchema,
  depth_charts: depthChartsSchema,
  combine: combineSchema,
};
