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

export const tradeSchema = z
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

export const teamsSchema = z
  .object({
    team_abbr: z.coerce.string().describe("The team's abbreviation, e.g. ARI = Arizona Cardinals"),
    team_name: z.coerce.string().describe("The team's full name, e.g. Arizona Cardinals"),
    team_id: z.coerce.number().int().describe("The team's nflverse ID, e.g. 3800."),
    team_nick: z.coerce.string().describe("The team's short name, e.g. Cardinals."),
    team_conf: z.coerce.string().describe("The team's conference, e.g. NFC"),
    team_division: z.coerce.string().describe("The team's division, e.g. NFC West"),
    team_color: hexColorSchema.describe("The team's primary color"),
    team_color2: hexColorSchema.describe("The team's secondary color"),
    team_color3: hexColorSchemaNullish.describe("The team's tertiary color"),
    team_color4: hexColorSchemaNullish.describe("The team's quaternary color"),
    team_logo_wikipedia: coercedUrl.describe("The team's Wikipedia Logo URI, may be invalid."),
    team_logo_espn: coercedUrl.describe("The team's ESPN logo URI"),
    team_wordmark: coercedUrl.describe("The team's NFL Verse Wordmark image URI"),
    team_logo_squared: coercedUrl.describe("The team's NFL Verse Square Logo image URI"),
    team_conference_logo: coercedUrl.describe("The conference's NFL Verse logo URI"),
    team_league_logo: coercedUrl.describe("The league's NFL Verse Logo URI"),
  })
  .describe("An NFL team");

export const gamesSchema = z
  .object({
    game_id: z.coerce
      .string()
      .describe("NFL Verse ID of the game. Format (ish): YEAR_WEEK_AWAYTEAMABBR_HOMETEAMABBR"),
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
    week: z.coerce.number().int().describe("The week of the season the game took place"),
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
    gametime: nullishString.describe("The time of day the game was played at."),
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
    old_game_id: z.coerce.number().int().describe("The previously used NFL Verse game ID."),
    // NFL GSIS ID
    gsis: nullishIntTx.describe("NFL Game Statistics & Information System ID"),
    // NFL Detail ID (very little use)
    nfl_detail_id: nullishStringSub(z.uuid()).describe("NFL Detail ID"),
    // Pro football reference ID
    pfr: z.coerce.string().describe("Pro football reference ID"),
    // Pro football focus ID
    pff: nullishIntTx.describe("Pro football focus ID"),
    // ESPN ID
    espn: z.coerce.number().int().describe("ESPN ID"),
    // For the numbers (fantasy) ID
    ftn: nullishIntTx.describe("For the numbers ID"),
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
      "The odds the away team will win the game, as a moneyline",
    ),
    home_moneyline: nullishIntTx.describe(
      "The odds the home team will win the game, as a moneyline",
    ),
    spread_line: nullishFloatTx.describe(
      "The expected points differential of the game, as a line. Positive = home team win.",
    ),
    away_spread_odds: nullishIntTx.describe(
      "//TODO what is this? its a really small moneyline thing",
    ),
    home_spread_odds: nullishIntTx.describe(
      "//TODO what is this? its a really small moneyline thing",
    ),
    total_line: nullishFloatTx.describe("The total score line."),
    under_odds: nullishIntTx.describe("The odds that the total score is below the line"),
    over_oods: nullishIntTx.describe("The odds that the total score is below the line"),
    div_game: boolZ1.describe(
      "Whether the game is a divisional game (i.e. both teams are in the same division)",
    ),
    roof: nullishStringSub(z.enum(["outdoors", "dome", "closed", "open"])).describe(
      "The roofing type of the stadium",
    ),
    surface: nullishStringSub(
      z.union([
        z.enum([
          "matrixturf",
          "grass",
          "astroturf",
          "fieldturf",
          "a_turf", // TODO a_turf is likely astroturf
          "sportturf",
          "astroplay",
          "dessograss",
        ]),
        z.string(),
      ]),
    ).describe("The surface the players play on."),
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
  //TODO the player stats + team stats schemas have bad descriptions
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
      "LS", // TODO standardized schema for these position names + their mappings
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
    z.enum(["DB", "DL", "QB", "LB", "TE", "RB", "SPEC", "WR", "OL"]), // TODO likewise, standard position group schema
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
  headshot_url: nullishStringSub(z.url()).describe("The headshot of the player"),
  season: z.coerce.number().int().describe("The season (year) of the game"),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["POST", "REG", "REG+POST"]))
    .describe("The type of game this stat applies to"),

  // Standard stats categories
  completions: z.coerce.number().int().describe("The number of completed passes this team got"),
  attempts: z.coerce.number().int().describe("The number of pass attempts this team had"),
  passing_yards: z.coerce
    .number()
    .describe("The number of yards of passing offence the team achieved"),
  passing_tds: z.coerce.number().int().describe("The number of passing touchdowns the team scored"),
  passing_interceptions: z.coerce
    .number()
    .int()
    .describe("The number of interceptions the team threw while on offense"),
  sacks_suffered: z.coerce.number().int().describe("The number of sacks this team allowed"),
  sack_yards_lots: z.coerce.number().describe("The number of yards the team lost due to sacks"),
  sack_fumbles: z.coerce.number().int().describe("The number of sacks which resulted in fumbles"),
  sack_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of sack->fumbles which were lost to the other team"),
  passing_air_yards: z.coerce
    .number()
    .describe("The number of yards of passing offense that occurred in the air"),
  passing_yards_after_catch: z.coerce
    .number()
    .describe(
      "The number of yards of passing offense that occurred after the receiver made the catch",
    ),
  passing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs the team achieved using passes"),
  passing_epa: z.coerce.number().describe("The EPA (expected points added) by the passing offense"),
  passing_cpoe: nullishFloatTx.describe(
    "The CPOE (completion percentage over expected) by the passing offense",
  ),
  passing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of 2 point conversions made using passing"),
  pacr: z.coerce.number().describe("The passing air conversion ratio (PACR) of the player"),
  passing_10: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 10 or more yards"),
  passing_16: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in an explosive (16+ yards) play"),
  passing_20: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 20 or more yards"),
  passing_40: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 40 or more yards"),
  carries: z.coerce.number().int().describe("The number of rushing attempts the team made"),
  rushing_yards: z.coerce.number().describe("The number of yards gained via rushing"),
  rushing_tds: z.coerce.number().int().describe("The number of touchdowns scored via rushing"),
  rushing_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a rush play"),
  rushing_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a rush play which resulted in a turnover"),
  rushing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs gained via rushing"),
  rushing_epa: z.coerce.number().describe("The EPA (expected points added) by the rushing offense"),
  rushing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of 2 point conversions made using rushes"),
  rushing_10: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in a gain of 10 or more yards"),
  rushing_12: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in an explosive (12+ yards) play"),
  rushing_20: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in a gain of 20 or more yards"),
  rushing_40: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in a gain of 40 or more yards"),
  receptions: z.coerce.number().int().describe("The number of receptions the team had"),
  targets: z.coerce
    .number()
    .int()
    .describe("The number of times a receiver was targeted by a pass"),
  receiving_yards: z.coerce
    .number()
    .int()
    .describe("The number of yards the team gained by receiving."),
  receiving_tds: z.coerce.number().int().describe("The number of touchdowns scored via receiving"),
  receiving_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a pass play"),
  receiving_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a pass play which resulted in a turnover"),
  receiving_air_yards: z.coerce
    .number()
    .describe("The number of yards gained through the air for receptions"),
  receiving_yards_after_catch: z.coerce
    .number()
    .describe("The number of yards gained on the ground after a reception"),
  receiving_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs gained via receiving"),
  receiving_epa: z.coerce
    .number()
    .describe("The EPA (expected points added) by the receiving offense"),
  receiving_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of 2 point conversions made using passes"),
  receiving_10: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 10 or more yards"),
  receiving_16: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in an explosive (16+ yards) play"),
  receiving_20: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 20 or more yards"),
  receiving_40: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 40 or more yards"),
  racr: z.coerce.number().describe("The receiving air conversion ration (RACR) of the player"),
  target_share: z.coerce.number().describe("The percentage of targets that went to this player"),
  air_yards_share: z.coerce
    .number()
    .describe("The percentage of air yards that this player caught"),
  wopr: z.coerce.number().describe("The weighted opportunity rating (WOPR) of the player"),
  special_teams_tds: z.coerce
    .number()
    .int()
    .describe(
      "The number of touchdowns scored by special teams (punt/kickoff return tds, blocked fg tds)",
    ),
  def_tackles_solo: z.coerce.number().describe("The number of solo tackles achieved"),
  def_tackles_with_assist: z.coerce.number().describe("The number of tackles achieved with help"),
  def_tackle_assists: z.coerce.number().describe("The number of assists made on tackles"),
  def_tackles_for_loss: z.coerce
    .number()
    .describe("The number of tackles made which resulted in the offense losing yards"),
  def_tackles_for_loss_yards: z.coerce
    .number()
    .describe("The number of yards the opposing offense lost due to tackles for loss"),
  def_fumbles_forced: z.coerce
    .number()
    .int()
    .describe("The number of fumbles forced out of the opposing offense"),
  def_sacks: z.coerce.number().describe("The number of sacks made on the opposing qb"),
  def_sack_yards: z.coerce
    .number()
    .describe("The number of yards the opposing offense lost due to sacks"),
  def_qb_hits: z.coerce.number().describe("The number of hits on the opposing qb"),
  def_interceptions: z.coerce.number().describe("The number of interceptions made"),
  def_interception_yards: z.coerce
    .number()
    .describe("The number of yards gained after making interceptions"),
  def_pass_defended: z.coerce.number().describe("The number of passes defended (broken up)"),
  def_tds: z.coerce.number().describe("The number of defensive tds scored (pick-6 or fumble->td"),
  def_fumbles: z.coerce.number().describe("The number of fumbles recovered by the defense"),
  def_safeties: z.coerce.number().describe("The number of safeties forced by the defense"),
  def_punt_blocks: z.coerce.number().describe("The number of blocked punts"),
  def_pat_blocks: z.coerce
    .number()
    .describe("The number of PAT kick (1pt kick after touchdown) blocks"),
  def_fg_blocks: z.coerce.number().describe("The number of blocked field goals"),
  def_2pt_atts: z.coerce
    .number()
    .describe("The number of 2pt conversion attempts against the defense"),
  def_2pt_made: z.coerce
    .number()
    .describe("The number of 2pt conversion attempts the defense allowed to score"),
  misc_yards: z.coerce.number().describe("The number of miscellaneous yards the team gained"),
  fumble_recovery_own: z.coerce
    .number()
    .describe("The number of fumbles this team had that they also recovered"),
  fumble_recovery_yards_own: z.coerce
    .number()
    .describe("The number of yards gained/lost due to recovering their own fumbles"),
  fumble_recovery_opp: z.coerce
    .number()
    .describe("The number of fumbles recovered that the other team gave up"),
  fumble_recovery_yards_opp: z.coerce
    .number()
    .describe("The number of yards gained/lost due to recovering the opposition's fumbles"),
  fumble_recovery_tds: z.coerce
    .number()
    .describe("The number of touchdowns scored on a fumble recovery"),
  penalties: z.coerce.number().describe("The number of penalties incurred"),
  penalty_yards: z.coerce.number().describe("The number of yards lost due to penalties"),
  timeouts: z.coerce.number().describe("The number of timeouts taken"),
  fumbles_forced_by_opp: z.coerce
    .number()
    .describe("The number of fumbles the opposing team forced"),
  fumbles_not_forced: z.coerce.number().describe("The number of fumbles that were unforced"),
  fumbles_out_of_bounds: z.coerce
    .number()
    .describe("The number of fumbles that went out of bounds"),
  fumbles_total: z.coerce.number().describe("The total count of fumbles"),
  fumbles_lost_total: z.coerce
    .number()
    .describe("The total count of fumbles given up to the opposing team"),
  punt_returns: z.coerce.number().describe("The number of times a punt was returned any distance"),
  punt_return_yards: z.coerce
    .number()
    .describe("The number of yards gained/lost during punt returns"),
  kickoff_returns: z.coerce
    .number()
    .describe("The number of times a kickoff was returned any distance"),
  kickoff_return_yards: z.coerce
    .number()
    .describe("The number of yards gained/lost during kickoff returns"),
  fg_made: z.coerce.number().describe("The number of field goals made"),
  fg_att: z.coerce.number().describe("The number of field goals attempted"),
  fg_missed: z.coerce.number().describe("The number of field goals missed"),
  fg_blocked: z.coerce.number().describe("The number of field goal attempts which were blocked"),
  fg_long: nullishFloatTx.describe("The longest field goal yardage"),
  fg_pct: nullishFloatTx.describe("The field goal make percentage"),
  fg_made_0_19: z.coerce.number().describe("The number of field goals made between 0 and 19 yards"),
  fg_made_20_29: z.coerce
    .number()
    .describe("The number of field goals made between 20 and 29 yards"),
  fg_made_30_39: z.coerce
    .number()
    .describe("The number of field goals made between 30 and 39 yards"),
  fg_made_40_49: z.coerce
    .number()
    .describe("The number of field goals made between 40 and 49 yards"),
  fg_made_50_59: z.coerce
    .number()
    .describe("The number of field goals made between 50 and 59 yards"),
  fg_made_60_: z.coerce.number().describe("The number of field goals made at 60+ yards"),
  fg_missed_0_19: z.coerce
    .number()
    .describe("The number of field goals missed between 0 and 19 yards"),
  fg_missed_20_29: z.coerce
    .number()
    .describe("The number of field goals missed between 20 and 29 yards"),
  fg_missed_30_39: z.coerce
    .number()
    .describe("The number of field goals missed between 30 and 39 yards"),
  fg_missed_40_49: z.coerce
    .number()
    .describe("The number of field goals missed between 40 and 49 yards"),
  fg_missed_50_59: z.coerce
    .number()
    .describe("The number of field goals missed between 50 and 59 yards"),
  fg_missed_60_: z.coerce.number().describe("The number of field goals missed at 60+ yards"),
  fg_made_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which field goals were made"),
  fg_missed_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which field goals were missed"),
  fg_blocked_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which field goals were blocked"),
  fg_made_distance: z.coerce.number().describe("The total yardage covered by made fieldgoals"),
  fg_missed_distance: z.coerce.number().describe("The total yardage covered by missed fieldgoals"),
  fg_blocked_distance: z.coerce
    .number()
    .describe("The total yardage of fieldgoals which were blocked"),
  pat_made: z.coerce.number().describe("The number of extra point attempts (PAT) made"),
  pat_att: z.coerce.number().describe("The number of extra point attempts (PAT) tried"),
  pat_missed: z.coerce.number().describe("The number of extra point attempts (PAT) missed"),
  pat_blocked: z.coerce.number().describe("The number of extra point attempts (PAT) blocked"),
  pat_pct: nullishFloatTx.describe("The percentage make rate of extra point attempts (PAT)"),
  gwfg_made: z.coerce.number().describe("The number of game winning fieldgoals made"),
  gwfg_att: z.coerce.number().describe("The number of game winning fieldgoals attempted"),
  gwfg_missed: z.coerce.number().describe("The number of game winning fieldgoals missed"),
  gwfg_blocked: z.coerce.number().describe("The number of game winning fieldgoals blocked"),
  gwfg_distance_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which game winning field goals were attempted"),
  pt_att: z.coerce.number().describe("The number of punts attempted"),
  pt_blocked: z.coerce.number().describe("The number of attempted punts that were blocked"),
  pt_long: z.coerce.number().describe("The longest punt distance achieved"),
  pt_yards: z.coerce.number().describe("The total yardage achieved via punts"),
  pt_inside_20: z.coerce
    .number()
    .describe("The number of punts which ended up inside the 20 yard line of the opponent"),
  pt_out_of_bounds: z.coerce.number().describe("The number of punts which ended up out of bounds"),
  pt_downed: z.coerce.number().describe("The number of punts the punting team downed"),
  pt_touchback: z.coerce.number().describe("The number of punts which resulted in a touchback"),
  pt_fair_caught: z.coerce
    .number()
    .describe("The number of punts where the returner fair-caught the ball"),
  pt_returned: z.coerce
    .number()
    .describe("The number of punts where the returner returned the ball any distance"),
  pt_return_yards: z.coerce.number().describe("The number of yards conceded to punt returns"),
  pt_return_tds: z.coerce.number().describe("The number of punt return touchdowns conceded"),
  pt_net_yards: z.coerce
    .number()
    .describe("The net number of yards achieved via punts (punt yards - punt return yards)"),
  fantasy_points: z.coerce.number().describe("The fantasy points this player scored"),
  fantasy_points_ppr: z.coerce
    .number()
    .describe("The fantasy points (using PPR) this player scored"),
});

const playerStatsSchemaSeason = playerStatsSchemaBase.extend({
  games: z.coerce.number().int().describe("The number of games this team played"),
  recent_team: z.coerce.string().describe("The team (Abbreviation) this stat line is for"),
});

const playerStatsSchemaWeek = playerStatsSchemaBase.extend({
  week: z.coerce.number().describe("The week of the season in which this game happened"),
  team: z.coerce.string().describe("The team (Abbreviation) this stat line is for"),
  game_id: z.coerce.string(),
  opponent: z.coerce.string(),
});

const teamStatsSchemaBase = z.object({
  // Base info
  season: z.coerce.number().int().describe("The season (year) of the game"),
  team: z.coerce.string().describe("The team (Abbreviation) this stat line is for"),
  season_type: z
    .pipe(z.coerce.string(), z.enum(["POST", "REG", "REG+POST"]))
    .describe("The type of game this stat applies to"),

  // Standard stats categories
  completions: z.coerce.number().int().describe("The number of completed passes this team got"),
  attempts: z.coerce.number().int().describe("The number of pass attempts this team had"),
  passing_yards: z.coerce
    .number()
    .describe("The number of yards of passing offence the team achieved"),
  passing_tds: z.coerce.number().int().describe("The number of passing touchdowns the team scored"),
  passing_interceptions: z.coerce
    .number()
    .int()
    .describe("The number of interceptions the team threw while on offense"),
  sacks_suffered: z.coerce.number().int().describe("The number of sacks this team allowed"),
  sack_yards_lots: z.coerce.number().describe("The number of yards the team lost due to sacks"),
  sack_fumbles: z.coerce.number().int().describe("The number of sacks which resulted in fumbles"),
  sack_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of sack->fumbles which were lost to the other team"),
  passing_air_yards: z.coerce
    .number()
    .describe("The number of yards of passing offense that occurred in the air"),
  passing_yards_after_catch: z.coerce
    .number()
    .describe(
      "The number of yards of passing offense that occurred after the receiver made the catch",
    ),
  passing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs the team achieved using passes"),
  passing_epa: z.coerce.number().describe("The EPA (expected points added) by the passing offense"),
  passing_cpoe: nullishFloatTx.describe(
    "The CPOE (completion percentage over expected) by the passing offense",
  ),
  passing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of 2 point conversions made using passing"),
  passing_10: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 10 or more yards"),
  passing_16: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in an explosive (16+ yards) play"),
  passing_20: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 20 or more yards"),
  passing_40: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 40 or more yards"),
  carries: z.coerce.number().int().describe("The number of rushing attempts the team made"),
  rushing_yards: z.coerce.number().describe("The number of yards gained via rushing"),
  rushing_tds: z.coerce.number().int().describe("The number of touchdowns scored via rushing"),
  rushing_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a rush play"),
  rushing_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a rush play which resulted in a turnover"),
  rushing_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs gained via rushing"),
  rushing_epa: z.coerce.number().describe("The EPA (expected points added) by the rushing offense"),
  rushing_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of 2 point conversions made using rushes"),
  rushing_10: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in a gain of 10 or more yards"),
  rushing_12: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in an explosive (12+ yards) play"),
  rushing_20: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in a gain of 20 or more yards"),
  rushing_40: z.coerce
    .number()
    .int()
    .describe("The number of rushes which resulted in a gain of 40 or more yards"),
  receptions: z.coerce.number().int().describe("The number of receptions the team had"),
  targets: z.coerce
    .number()
    .int()
    .describe("The number of times a receiver was targeted by a pass"),
  receiving_yards: z.coerce
    .number()
    .int()
    .describe("The number of yards the team gained by receiving."),
  receiving_tds: z.coerce.number().int().describe("The number of touchdowns scored via receiving"),
  receiving_fumbles: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a pass play"),
  receiving_fumbles_lost: z.coerce
    .number()
    .int()
    .describe("The number of fumbles the team had during a pass play which resulted in a turnover"),
  receiving_air_yards: z.coerce
    .number()
    .describe("The number of yards gained through the air for receptions"),
  receiving_yards_after_catch: z.coerce
    .number()
    .describe("The number of yards gained on the ground after a reception"),
  receiving_first_downs: z.coerce
    .number()
    .int()
    .describe("The number of first downs gained via receiving"),
  receiving_epa: z.coerce
    .number()
    .describe("The EPA (expected points added) by the receiving offense"),
  receiving_2pt_conversions: z.coerce
    .number()
    .int()
    .describe("The number of 2 point conversions made using passes"),
  receiving_10: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 10 or more yards"),
  receiving_16: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in an explosive (16+ yards) play"),
  receiving_20: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 20 or more yards"),
  receiving_40: z.coerce
    .number()
    .int()
    .describe("The number of passes which resulted in a gain of 40 or more yards"),
  special_teams_tds: z.coerce
    .number()
    .int()
    .describe(
      "The number of touchdowns scored by special teams (punt/kickoff return tds, blocked fg tds)",
    ),
  def_tackles_solo: z.coerce.number().describe("The number of solo tackles achieved"),
  def_tackles_with_assist: z.coerce.number().describe("The number of tackles achieved with help"),
  def_tackle_assists: z.coerce.number().describe("The number of assists made on tackles"),
  def_tackles_for_loss: z.coerce
    .number()
    .describe("The number of tackles made which resulted in the offense losing yards"),
  def_tackles_for_loss_yards: z.coerce
    .number()
    .describe("The number of yards the opposing offense lost due to tackles for loss"),
  def_fumbles_forced: z.coerce
    .number()
    .int()
    .describe("The number of fumbles forced out of the opposing offense"),
  def_sacks: z.coerce.number().describe("The number of sacks made on the opposing qb"),
  def_sack_yards: z.coerce
    .number()
    .describe("The number of yards the opposing offense lost due to sacks"),
  def_qb_hits: z.coerce.number().describe("The number of hits on the opposing qb"),
  def_interceptions: z.coerce.number().describe("The number of interceptions made"),
  def_interception_yards: z.coerce
    .number()
    .describe("The number of yards gained after making interceptions"),
  def_pass_defended: z.coerce.number().describe("The number of passes defended (broken up)"),
  def_tds: z.coerce.number().describe("The number of defensive tds scored (pick-6 or fumble->td"),
  def_fumbles: z.coerce.number().describe("The number of fumbles recovered by the defense"),
  def_safeties: z.coerce.number().describe("The number of safeties forced by the defense"),
  def_punt_blocks: z.coerce.number().describe("The number of blocked punts"),
  def_pat_blocks: z.coerce
    .number()
    .describe("The number of PAT kick (1pt kick after touchdown) blocks"),
  def_fg_blocks: z.coerce.number().describe("The number of blocked field goals"),
  def_2pt_atts: z.coerce
    .number()
    .describe("The number of 2pt conversion attempts against the defense"),
  def_2pt_made: z.coerce
    .number()
    .describe("The number of 2pt conversion attempts the defense allowed to score"),
  misc_yards: z.coerce.number().describe("The number of miscellaneous yards the team gained"),
  fumble_recovery_own: z.coerce
    .number()
    .describe("The number of fumbles this team had that they also recovered"),
  fumble_recovery_yards_own: z.coerce
    .number()
    .describe("The number of yards gained/lost due to recovering their own fumbles"),
  fumble_recovery_opp: z.coerce
    .number()
    .describe("The number of fumbles recovered that the other team gave up"),
  fumble_recovery_yards_opp: z.coerce
    .number()
    .describe("The number of yards gained/lost due to recovering the opposition's fumbles"),
  fumble_recovery_tds: z.coerce
    .number()
    .describe("The number of touchdowns scored on a fumble recovery"),
  penalties: z.coerce.number().describe("The number of penalties incurred"),
  penalty_yards: z.coerce.number().describe("The number of yards lost due to penalties"),
  timeouts: z.coerce.number().describe("The number of timeouts taken"),
  fumbles_forced_by_opp: z.coerce
    .number()
    .describe("The number of fumbles the opposing team forced"),
  fumbles_not_forced: z.coerce.number().describe("The number of fumbles that were unforced"),
  fumbles_out_of_bounds: z.coerce
    .number()
    .describe("The number of fumbles that went out of bounds"),
  fumbles_total: z.coerce.number().describe("The total count of fumbles"),
  fumbles_lost_total: z.coerce
    .number()
    .describe("The total count of fumbles given up to the opposing team"),
  punt_returns: z.coerce.number().describe("The number of times a punt was returned any distance"),
  punt_return_yards: z.coerce
    .number()
    .describe("The number of yards gained/lost during punt returns"),
  kickoff_returns: z.coerce
    .number()
    .describe("The number of times a kickoff was returned any distance"),
  kickoff_return_yards: z.coerce
    .number()
    .describe("The number of yards gained/lost during kickoff returns"),
  fg_made: z.coerce.number().describe("The number of field goals made"),
  fg_att: z.coerce.number().describe("The number of field goals attempted"),
  fg_missed: z.coerce.number().describe("The number of field goals missed"),
  fg_blocked: z.coerce.number().describe("The number of field goal attempts which were blocked"),
  fg_long: nullishFloatTx.describe("The longest field goal yardage"),
  fg_pct: nullishFloatTx.describe("The field goal make percentage"),
  fg_made_0_19: z.coerce.number().describe("The number of field goals made between 0 and 19 yards"),
  fg_made_20_29: z.coerce
    .number()
    .describe("The number of field goals made between 20 and 29 yards"),
  fg_made_30_39: z.coerce
    .number()
    .describe("The number of field goals made between 30 and 39 yards"),
  fg_made_40_49: z.coerce
    .number()
    .describe("The number of field goals made between 40 and 49 yards"),
  fg_made_50_59: z.coerce
    .number()
    .describe("The number of field goals made between 50 and 59 yards"),
  fg_made_60_: z.coerce.number().describe("The number of field goals made at 60+ yards"),
  fg_missed_0_19: z.coerce
    .number()
    .describe("The number of field goals missed between 0 and 19 yards"),
  fg_missed_20_29: z.coerce
    .number()
    .describe("The number of field goals missed between 20 and 29 yards"),
  fg_missed_30_39: z.coerce
    .number()
    .describe("The number of field goals missed between 30 and 39 yards"),
  fg_missed_40_49: z.coerce
    .number()
    .describe("The number of field goals missed between 40 and 49 yards"),
  fg_missed_50_59: z.coerce
    .number()
    .describe("The number of field goals missed between 50 and 59 yards"),
  fg_missed_60_: z.coerce.number().describe("The number of field goals missed at 60+ yards"),
  fg_made_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which field goals were made"),
  fg_missed_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which field goals were missed"),
  fg_blocked_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which field goals were blocked"),
  fg_made_distance: z.coerce.number().describe("The total yardage covered by made fieldgoals"),
  fg_missed_distance: z.coerce.number().describe("The total yardage covered by missed fieldgoals"),
  fg_blocked_distance: z.coerce
    .number()
    .describe("The total yardage of fieldgoals which were blocked"),
  pat_made: z.coerce.number().describe("The number of extra point attempts (PAT) made"),
  pat_att: z.coerce.number().describe("The number of extra point attempts (PAT) tried"),
  pat_missed: z.coerce.number().describe("The number of extra point attempts (PAT) missed"),
  pat_blocked: z.coerce.number().describe("The number of extra point attempts (PAT) blocked"),
  pat_pct: nullishFloatTx.describe("The percentage make rate of extra point attempts (PAT)"),
  gwfg_made: z.coerce.number().describe("The number of game winning fieldgoals made"),
  gwfg_att: z.coerce.number().describe("The number of game winning fieldgoals attempted"),
  gwfg_missed: z.coerce.number().describe("The number of game winning fieldgoals missed"),
  gwfg_blocked: z.coerce.number().describe("The number of game winning fieldgoals blocked"),
  gwfg_distance_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe("The list of distances from which game winning field goals were attempted"),
  pt_att: z.coerce.number().describe("The number of punts attempted"),
  pt_blocked: z.coerce.number().describe("The number of attempted punts that were blocked"),
  pt_long: z.coerce.number().describe("The longest punt distance achieved"),
  pt_yards: z.coerce.number().describe("The total yardage achieved via punts"),
  pt_inside_20: z.coerce
    .number()
    .describe("The number of punts which ended up inside the 20 yard line of the opponent"),
  pt_out_of_bounds: z.coerce.number().describe("The number of punts which ended up out of bounds"),
  pt_downed: z.coerce.number().describe("The number of punts the punting team downed"),
  pt_touchback: z.coerce.number().describe("The number of punts which resulted in a touchback"),
  pt_fair_caught: z.coerce
    .number()
    .describe("The number of punts where the returner fair-caught the ball"),
  pt_returned: z.coerce
    .number()
    .describe("The number of punts where the returner returned the ball any distance"),
  pt_return_yards: z.coerce.number().describe("The number of yards conceded to punt returns"),
  pt_return_tds: z.coerce.number().describe("The number of punt return touchdowns conceded"),
  pt_net_yards: z.coerce
    .number()
    .describe("The net number of yards achieved via punts (punt yards - punt return yards)"),
});

const teamStatsSchemaSeason = teamStatsSchemaBase.extend({
  games: z.coerce.number().int().describe("The number of games this team played"),
});

const teamStatsSchemaWeek = teamStatsSchemaBase.extend({
  week: z.coerce.number().describe("The week of the season in which this game happened"),
  game_id: z.coerce.string(),
  opponent: z.coerce.string(),
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
    "Which read was thrown to, if any",
  ),
  is_catchable_ball: boolZ1.describe("Whether the ball can be caught by the receiver or not"),
  is_contested_ball: boolZ1.describe("Whether the ball was contested by a defender"),
  is_created_reception: boolZ1.describe("//TODO idk"),
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
  exp_sack: z.coerce.number().describe("//TODO idk"),
  penalty: z.coerce.number().describe("//TODO idk"),
  qbr_raw: z.coerce.number().describe("The raw QBR for this player"),
  sack: z.coerce.number().describe("//TODO idk"),
  name_first: z.coerce.string().describe("The player's first name"),
  name_last: z.coerce.string().describe("The player's last name"),
  name_display: z.coerce.string().describe("The player's display name"),
  headshot_ref: nullishStringSub(z.url()).describe("The player's headshot image URI"),
  team: z.coerce.string().describe("The team (nickname) this player played for"),
  qualified: boolZ1.describe("//TODO idk"),
});

const espnQbrWeeklySchema = espnQbrSeasonalSchema.extend({
  // Different:
  game_id: z.coerce.string().describe("The ESPN Game ID (or maybe NFL Verse Old game ID)"),
  week_text: z.coerce.string().describe("The description of the game week"),
  opp_id: z.coerce.string().describe("The team ID (ESPN) of the opponent"),
  opp_abb: z.coerce.string().describe("The team (Abbreviation) of the opponent"),
  opp_team: z.coerce.string().describe("The full team name of the opponent"),
  opp_name: z.coerce.string().describe("The team nickname of the opponent"),
  week_num: z.coerce.number().describe("The week of the game"),
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
    .describe("The status of the player on the roster"),
  full_name: z.coerce.string().describe("The player's full name"),
  first_name: z.coerce.string().describe("The player's first name"),
  last_name: z.coerce.string().describe("The player's last name"),
  birth_date: z.pipe(z.coerce.string(), z.iso.date()).describe("The player's birth date"),
  height: z.coerce.number().describe("The player's height in inches"),
  weight: z.coerce.number().describe("The player's weight in lbs"),
  college: z.coerce.string().describe("The college the player went to"),
  gsis_id: z.coerce.string().describe("The player's GSIS ID"),
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
    "The game type for this week's game",
  ),
  status_description_abbr: nullishString.describe("The description (abbr) of this player's status"),
  football_name: nullishString.describe(
    "This player's first name for football //TODO difference from first name?",
  ),
  esb_id: nullishString.describe("The player's ESB ID //TODO what is this?"),
  gsis_it_id: nullishString.describe(
    "The player's GSIS IT ID // TODO how is this diff from gsis_id?",
  ),
  smart_id: nullishString.describe("The player's SMART ID //TODO what is this?"),
  entry_year: nullishIntTx.describe("The year the player entered the league"),
  rookie_year: nullishIntTx.describe("The player's rookie year"),
  draft_club: nullishString.describe(
    "The team (Abbreviation) of the club which drafted this player. Null = UDFA",
  ),
  draft_number: nullishIntTx.describe("The position in the draft that this player was taken at"),
});

const playerSchema = z.object({
  gsis_id: z.coerce.string().describe("The player's GSIS ID"),
  display_name: z.coerce.string(), // TODO describe remaining schema fields
  common_first_name: z.coerce.string(),
  first_name: z.coerce.string(),
  last_name: z.coerce.string(),
  short_name: nullishString,
  football_name: nullishString,
  suffix: nullishString,
  esb_id: nullishString,
  nfl_id: nullishString,
  pfr_id: nullishString,
  pff_id: nullishString,
  otc_id: nullishString, // otc=over the cap
  espn_id: nullishString,
  smart_id: nullishString,
  birth_date: z.pipe(z.coerce.string(), z.iso.date()),
  position_group: z.pipe(
    z.coerce.string(),
    z.enum(["DL", "RB", "LB", "SPEC", "WR", "DB", "TE", "OL", "QB"]),
  ),
  position: z.pipe(
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
  ),
  ngs_position_group: nullishStringSub(
    z.enum(["RB", "WR", "DL", "DB", "OL", "TE", "LB", "QB", "SPEC"]),
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
  ),
  height: nullishIntTx, // inches
  weight: nullishIntTx, // lbs
  headshot: nullishStringSub(z.url()),
  college_name: nullishString,
  college_conference: nullishString,
  jersey_number: nullishString,
  rookie_season: z.coerce.number().int(),
  last_season: nullishIntTx,
  latest_team: z.coerce.string(),
  status: nullishStringSub(
    z.enum([
      "DEV",
      "ACT", // TODO mapping
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
  ),
  ngs_status_short_description: nullishString,
  years_of_experience: z.coerce.number().int(),
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
  ),
  pff_status: nullishStringSub(
    z.enum(["A", "P", "IR", "I", "S", "IRD", "RPUP", "PINJ", "DNR", "APUP", "RNFI", "PSUS"]),
  ),
  draft_year: nullishIntTx,
  draft_round: nullishIntTx,
  draft_pick: nullishIntTx,
  draft_team: nullishString,
});

const officialsSchema = z.object({
  game_id: z.coerce.string(),
  game_key: z.coerce.string(),
  official_name: z.coerce.string(),
  position: z.coerce.string(),
  jersey_number: z.coerce.string(),
  official_id: z.coerce.string(),
  season: z.coerce.number().int(),
  season_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB", "POST"])),
  week: z.coerce.number().int(),
});

const draftPicksSchema = z.object({
  season: z.coerce.number().int(),
  round: z.coerce.number().int(),
  pick: z.coerce.number().int(),
  team: z.coerce.string(), // abbr
  gsis_id: z.coerce.string(),
  pfr_player_id: z.coerce.string(),
  cfb_player_id: nullishString,
  pfr_player_name: nullishString,
  hof: boolZ1,
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
  ),
  category: z.pipe(
    z.coerce.string(),
    z.enum(["RB", "WR", "OL", "DL", "TE", "DB", "QB", "LB", "P", "K", "KR", "LS", "FS", "OG"]),
  ),
  size: nullishStringSub(z.enum(["O", "D", "S"])),
  college: nullishString,
  age: z.coerce.number().int(),
  to: nullishIntTx, // player last yr
  allpro: z.coerce.number().int(), // all-pro count
  probowls: z.coerce.number().int(), // probowl count
  seasons_started: z.coerce.number().int(),
  w_av: nullishIntTx, // TODO ??
  car_av: z.coerce.string(), // TODO ?? - only empty
  dr_av: nullishIntTx, // TODO ??
  games: nullishIntTx,
  // TODO most of these stats are also in the full player stats set
  pass_completions: nullishIntTx,
  pass_attempts: nullishIntTx,
  pass_yards: nullishIntTx,
  pass_tds: nullishIntTx,
  pass_ints: nullishIntTx,
  rush_atts: nullishIntTx,
  rush_yards: nullishIntTx,
  rush_tds: nullishIntTx,
  receptions: nullishIntTx,
  rec_yards: nullishIntTx,
  rec_tds: nullishIntTx,
  def_solo_tackles: nullishIntTx,
  def_ints: nullishIntTx,
  def_sacks: nullishIntTx,
});

const histContractsSchema = z.object({
  player: z.coerce.string(), // full name
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
  ),
  team: z.coerce.string(), // team nickname OR abbrs if multiple teams (e.g. LAR/SEA)
  is_active: boolZ1,
  year_signed: z.coerce.number().int(),
  years: z.coerce.string(), // TODO n/a (exact str is "NA") or number,
  value: z.coerce.number(),
  apy: z.coerce.number(),
  guaranteed: z.coerce.number(),
  apy_cap_pct: z.coerce.number(),
  inflated_value: z.coerce.number(),
  inflated_apy: z.coerce.number(),
  inflated_guaranteed: z.coerce.number(),
  player_page: z.pipe(z.coerce.string(), z.url()), // otc url
  otc_id: z.coerce.string(),
  // Many of these are not useful
  date_of_birth: z.coerce.string(), // informal dob, ignore and use other sources
  height: z.coerce.string(), // informal height in ft'in", ignore and use other sources
  weight: z.coerce.string(), // weight in lbs, but can be "NA" - ignore and use other sources
  college: z.coerce.string(),
  draft_year: z.coerce.string(),
  draft_round: z.coerce.string(),
  draft_overall: z.coerce.string(),
  draft_team: z.coerce.string(),
  season_history: z.coerce.string(),
});

// "game_id":"2026_01_ARI_LAC","pfr_game_id":"202609130sdg","season":2026,"game_type":"REG","week":1,"player":"Cole Strange","pfr_player_id":"StraCo01","position":"G","team":"LAC","opponent":"ARI","offense_snaps":55,"offense_pct":1,"defense_snaps":0,"defense_pct":0,"st_snaps":2,"st_pct":0.08

export const snapCountSchema = z.object({
  game_id: z.coerce.string(), // nflverse game id
  pfr_game_id: z.coerce.string(),
  season: z.coerce.number(),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"])),
  week: z.coerce.number(),
  player: z.coerce.string(),
  pfr_player_id: z.coerce.string(),
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
  ),
  team: z.coerce.string(), // abbr
  opponent: z.coerce.string(), // abbr
  offense_snaps: z.coerce.number(),
  offense_pct: z.coerce.number(),
  defense_snaps: z.coerce.number(),
  defense_pct: z.coerce.number(),
  st_snaps: z.coerce.number(),
  st_pct: z.coerce.number(),
});

export const rostersSchema = z.object({
  season: z.coerce.number(),
  team: z.coerce.string(), // abbr
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
  ),
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
  ),
  jersey_number: z.coerce.string(),
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
  ),
  full_name: nullishString,
  first_name: z.coerce.string(),
  last_name: z.coerce.string(),
  birth_date: nullishString, // fmt: Thu Jan 21 1982 16:00:00 GMT-0800 (Pacific Standard Time), kind of not needed
  height: nullishIntTx, // inches
  weight: nullishIntTx, // lbs
  college: nullishString,
  gsis_id: nullishString,
  espn_id: nullishString,
  sportradar_id: nullishString,
  yahoo_id: nullishString,
  rotowire_id: nullishString,
  pff_id: nullishString,
  pfr_id: nullishString,
  fantasy_data_id: nullishString,
  sleeper_id: nullishString,
  esb_id: nullishString,
  gsis_it_id: nullishString,
  smart_id: nullishString,

  years_exp: nullishIntTx,
  headshot_url: nullishStringSub(z.url()),
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
  ),
  week: z.coerce.number(),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "CON", "DIV", "SB"])),
  status_description_abbr: nullishString,
  football_name: nullishString,
  entry_year: nullishIntTx,
  rookie_year: nullishIntTx,
  draft_club: nullishString, // abbr
  draft_number: nullishIntTx,
});

// pfrAdvancedStats teams can show (N)TM for team name, this means 2+ teams
const pfrAdvStats_sznDef_schema = z.object({
  season: z.coerce.number().int(),
  player: z.coerce.string(), // full name
  pfr_id: nullishString,
  tm: z.coerce.string(),
  age: z.coerce.number(),
  pos: nullishString,
  g: z.coerce.number(), // games
  gs: z.coerce.number(), // games started
  int: nullishFloatTx, // interceptions
  tgt: z.coerce.number(), // target ct (number of times the receiver this person defended against was targeted)
  cmp: z.coerce.number(), // Completions (likely cmps allowed)
  cmp_percent: nullishFloatTx, // Completion percentage (again, likely %cmp allowed)
  yds: z.coerce.number(),
  yds_cmp: nullishFloatTx,
  yds_tgt: nullishFloatTx,
  td: nullishFloatTx,
  rat: nullishFloatTx,
  dadot: nullishFloatTx,
  air: z.coerce.number(),
  yac: nullishFloatTx,
  blitz: z.coerce.number(),
  hrry: z.coerce.number(),
  qbkd: z.coerce.number(),
  sk: z.coerce.number(),
  prss: z.coerce.number(),
  comb: z.coerce.number(),
  m_tkl: z.coerce.number(),
  m_tkl_percent: nullishFloatTx,
  loaded: z.coerce.number(),
  bats: z.coerce.number(),
});

const pfrAdvStats_sznPass_schema = z.object({
  season: z.coerce.number().int(),
  player: z.coerce.string(),
  team: z.coerce.string(), // abbr
  pass_attempts: z.coerce.number(),
  throwaways: z.coerce.number(),
  spikes: z.coerce.number(),
  drops: z.coerce.number(),
  drop_pct: nullishFloatTx,
  bad_throws: z.coerce.number(),
  bad_throw_pct: nullishFloatTx,
  pfr_id: nullishString,
  pocket_time: nullishFloatTx,
  times_blitzed: z.coerce.number(),
  times_hurried: z.coerce.number(),
  times_hit: z.coerce.number(),
  times_pressured: z.coerce.number(),
  pressure_pct: nullishFloatTx,
  batted_balls: nullishFloatTx,
  on_tgt_throws: nullishFloatTx,
  on_tgt_pct: nullishFloatTx,
  rpo_plays: nullishFloatTx,
  rpo_yards: nullishFloatTx,
  rpo_pass_att: nullishFloatTx,
  rpo_pass_yards: nullishFloatTx,
  rpo_rust_att: nullishFloatTx,
  rpo_rush_yards: nullishFloatTx,
  pa_pass_att: nullishFloatTx,
  pa_pass_yards: nullishFloatTx,
  intended_air_yards: nullishFloatTx,
  intended_air_yards_per_pass_attempt: nullishFloatTx,
  completed_air_yards: nullishFloatTx,
  completed_air_yards_per_completion: nullishFloatTx,
  completed_air_yards_per_pass_attempt: nullishFloatTx,
  pass_yards_after_catch: nullishFloatTx,
  pass_yards_after_catch_per_completion: nullishFloatTx,
  scrambles: nullishFloatTx,
  scramble_yards_per_attempt: nullishFloatTx,
});
const pfrAdvStats_sznRush_schema = z.object({
  season: z.coerce.number().int(),
  player: z.coerce.string(),
  pfr_id: nullishString,
  tm: z.coerce.string(), // abbr
  age: z.coerce.number(),
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
  ),

  g: z.coerce.number(),
  gs: z.coerce.number(),
  att: z.coerce.number(),
  yds: z.coerce.number(),
  td: nullishFloatTx,
  x1d: nullishFloatTx,
  ybc: nullishFloatTx,
  ybc_att: nullishFloatTx,
  yac: nullishFloatTx,
  yac_att: nullishFloatTx,
  brk_tkl: nullishFloatTx,
  att_br: nullishFloatTx,
  loaded: z.coerce.number(),
});
const pfrAdvStats_sznRec_schema = z.object({
  season: z.coerce.number().int(),
  player: z.coerce.string(),
  pfr_id: nullishString,
  tm: z.coerce.string(), // abbr
  age: z.coerce.number(),
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
  ),
  g: z.coerce.number(),
  gs: z.coerce.number(),
  tgt: z.coerce.number(),
  rec: z.coerce.number(),
  yds: z.coerce.number(),
  td: nullishFloatTx,
  x1d: nullishFloatTx,
  ybc: nullishFloatTx,
  ybc_r: nullishFloatTx,
  yac: nullishFloatTx,
  yac_r: nullishFloatTx,
  adot: nullishFloatTx,
  brk_tkl: nullishFloatTx,
  rec_br: nullishFloatTx,
  drop: nullishFloatTx,
  drop_percent: nullishFloatTx,
  int: nullishFloatTx,
  rat: nullishFloatTx,
  loaded: z.coerce.number(),
});
const pfrAdvStats_wkDef_schema = z.object({
  game_id: z.coerce.string(),
  pfr_game_id: z.coerce.string(),
  season: z.coerce.number().int(),
  week: z.coerce.number().int(),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"])),
  team: z.coerce.string(), // abbr
  opponent: z.coerce.string(), // abbr
  pfr_player_name: z.coerce.string(),
  pfr_player_id: z.coerce.string(),
  def_ints: z.coerce.number(),
  def_targets: z.coerce.number(),
  def_completions_allowed: z.coerce.number(),
  def_completion_pct: nullishFloatTx,
  def_yards_allowed: nullishFloatTx,
  def_yards_allowed_per_cmp: nullishFloatTx,
  def_yards_allowed_per_tgt: nullishFloatTx,
  def_receiving_td_allowed: nullishFloatTx,
  def_passer_rating_allowed: nullishFloatTx,
  def_adot: nullishFloatTx,
  def_air_yards_completed: nullishFloatTx,
  def_yards_after_catch: nullishFloatTx,
  def_times_blitzed: nullishFloatTx,
  def_times_hurried: nullishFloatTx,
  def_times_hitqb: nullishFloatTx,
  def_sacks: z.coerce.number(),
  def_pressures: z.coerce.number(),
  def_tackles_combined: z.coerce.number(),
  def_missed_tackles: z.coerce.number(),
  def_missed_tackle_pct: nullishFloatTx,
});
const pfrAdvStats_wkPass_schema = z.object({
  game_id: z.coerce.string(),
  pfr_game_id: z.coerce.string(),
  season: z.coerce.number().int(),
  week: z.coerce.number().int(),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"])),
  team: z.coerce.string(), // abbr
  opponent: z.coerce.string(), // abbr
  pfr_player_name: z.coerce.string(),
  pfr_player_id: z.coerce.string(),
  passing_drops: nullishFloatTx,
  passing_drop_pct: nullishFloatTx,
  receiving_drop: nullishFloatTx,
  receiving_drop_pct: nullishFloatTx,
  passing_bad_throws: z.coerce.number(),
  passing_bad_throw_pct: nullishFloatTx,
  times_sacked: z.coerce.number(),
  times_blitzed: z.coerce.number(),
  times_hurried: z.coerce.number(),
  times_hit: z.coerce.number(),
  times_pressured: z.coerce.number(),
  times_pressured_pct: nullishFloatTx,
  def_times_blitzed: nullishFloatTx,
  def_times_hurried: nullishFloatTx,
  def_times_hitqb: nullishFloatTx,
});
const pfrAdvStats_wkRec_schema = z.object({
  game_id: z.coerce.string(),
  pfr_game_id: z.coerce.string(),
  season: z.coerce.number().int(),
  week: z.coerce.number().int(),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"])),
  team: z.coerce.string(), // abbr
  opponent: z.coerce.string(), // abbr
  pfr_player_name: z.coerce.string(),
  pfr_player_id: z.coerce.string(),
  rushing_broken_tackles: nullishFloatTx,
  receiving_broken_tackles: nullishFloatTx,
  passing_drops: nullishFloatTx,
  passing_drop_pct: nullishFloatTx,
  receiving_drop: nullishFloatTx,
  receiving_drop_pct: nullishFloatTx,
  receiving_int: z.coerce.number(),
  receiving_rat: z.coerce.number(), // I think rat=rating
});
const pfrAdvStats_wkRush_schema = z.object({
  game_id: z.coerce.string(),
  pfr_game_id: z.coerce.string(),
  season: z.coerce.number().int(),
  week: z.coerce.number().int(),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"])),
  team: z.coerce.string(), // abbr
  opponent: z.coerce.string(), // abbr
  pfr_player_name: z.coerce.string(),
  pfr_player_id: z.coerce.string(),
  carries: z.coerce.number(),
  rushing_yards_before_contact: z.coerce.number(),
  rushing_yards_before_contact_avg: nullishFloatTx,
  rushing_yards_after_contact: z.coerce.number(),
  rushing_yards_after_contact_avg: nullishFloatTx,
  rushing_broken_tackles: nullishFloatTx,
  receiving_broken_tackles: nullishFloatTx,
});

const pbpSchema = z.object({
  play_id: z.coerce.string(),
  game_id: z.coerce.string(),
  old_game_id: z.coerce.string(),
  home_team: z.coerce.string(), // abbr
  away_team: z.coerce.string(), // abbr
  season_type: z.pipe(z.coerce.string(), z.enum(["REG", "POST"])),
  week: z.coerce.number().int(),
  posteam: nullishString, // abbr
  posteam_type: nullishStringSub(z.enum(["away", "home"])),
  defteam: nullishString, // abbr
  side_of_field: z.coerce.string(), // team abbr OR 50
  yardline_100: nullishFloatTx,
  game_date: z.pipe(z.coerce.string(), z.iso.date()),
  quarter_seconds_remaining: nullishFloatTx,
  half_seconds_remaining: nullishFloatTx,
  game_seconds_remaining: nullishFloatTx,
  game_half: z.pipe(z.coerce.string(), z.enum(["Half1", "Half2", "Overtime"])),
  quarter_end: boolZ1,
  drive: nullishFloatTx,
  sp: boolZ1,
  qtr: z.coerce.number(),
  down: nullishFloatTx,
  goal_to_go: nullishFloatTx,
  time: nullishString, // String <= 15 minutes, game clock as str
  yrdln: nullishString, // fmt: [ABBR YARDLINE]
  ydstogo: z.coerce.number(),
  ydsnet: nullishFloatTx,
  desc: z.coerce.string(),
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
  ),
  yards_gained: nullishFloatTx,
  shotgun: boolZ1,
  no_huddle: boolZ1,
  qb_dropback: boolZ1N,
  qb_kneel: boolZ1N,
  qb_spike: boolZ1N,
  qb_scramble: boolZ1N,
  pass_length: nullishStringSub(z.enum(["short", "deep"])),
  pass_location: nullishStringSub(z.enum(["left", "middle", "right"])),
  air_yards: nullishFloatTx,
  yards_after_catch: nullishFloatTx,
  run_location: nullishStringSub(z.enum(["middle", "left", "right"])),
  run_gap: nullishStringSub(z.enum(["guard", "end", "tackle"])),
  field_goal_result: nullishStringSub(z.enum(["made", "missed", "blocked"])),
  kick_distance: nullishFloatTx,
  extra_point_result: nullishStringSub(z.enum(["good", "failed", "blocked", "aborted"])),
  two_point_conv_result: nullishStringSub(z.enum(["success", "failure"])),
  home_timeouts_remaining: z.coerce.number(),
  away_timeouts_remaining: z.coerce.number(),
  timeout: boolZ1N,
  timeout_team: nullishString, // abbr
  td_team: nullishString, // abbr
  td_player_name: nullishString, // short name (e.g. A.Rodgers)
  td_player_id: nullishString, // 00- fmt, i believe gsis-id
  posteam_timeouts_remaining: nullishFloatTx,
  defteam_timeouts_remaining: nullishFloatTx,
  total_home_score: z.coerce.number(),
  total_away_score: z.coerce.number(),
  posteam_score: nullishFloatTx,
  defteam_score: nullishFloatTx,
  score_differential: nullishFloatTx,
  posteam_score_post: nullishFloatTx,
  defteam_score_post: nullishFloatTx,
  score_differential_post: nullishFloatTx,
  no_score_prob: z.coerce.number(),
  opp_fg_prob: z.coerce.number(),
  opp_safety_prob: z.coerce.number(),
  opp_td_prob: z.coerce.number(),
  fg_prob: z.coerce.number(),
  safety_prob: z.coerce.number(),
  td_prob: z.coerce.number(),
  extra_point_prob: z.coerce.number(),
  two_point_conversion_prob: z.coerce.number(),
  ep: nullishFloatTx,
  epa: nullishFloatTx,
  total_home_epa: z.coerce.number(),
  total_away_epa: z.coerce.number(),
  total_home_rush_epa: z.coerce.number(),
  total_away_rush_epa: z.coerce.number(),
  total_home_pass_epa: z.coerce.number(),
  total_away_pass_epa: z.coerce.number(),
  air_epa: nullishFloatTx,
  yac_epa: nullishFloatTx,
  comp_air_epa: nullishFloatTx,
  comp_yac_epa: nullishFloatTx,
  total_home_comp_air_epa: nullishFloatTx,
  total_away_comp_air_epa: nullishFloatTx,
  total_home_comp_yac_epa: nullishFloatTx,
  total_away_comp_yac_epa: nullishFloatTx,
  total_home_raw_air_epa: nullishFloatTx,
  total_away_raw_air_epa: nullishFloatTx,
  total_home_raw_yac_epa: nullishFloatTx,
  total_away_raw_yac_epa: nullishFloatTx,
  wp: nullishFloatTx,
  def_wp: nullishFloatTx,
  home_wp: z.coerce.number(),
  away_wp: z.coerce.number(),
  wpa: nullishFloatTx,
  vegas_wpa: nullishFloatTx,
  vegas_home_wpa: nullishFloatTx,
  home_wp_post: nullishFloatTx,
  away_wp_post: nullishFloatTx,
  vegas_wp: nullishFloatTx,
  vegas_home_wp: z.coerce.number(),
  total_home_rush_wpa: z.coerce.number(),
  total_away_rush_wpa: z.coerce.number(),
  total_home_pass_wpa: z.coerce.number(),
  total_away_pass_wpa: z.coerce.number(),
  air_wpa: nullishFloatTx,
  yac_wpa: nullishFloatTx,
  comp_air_wpa: nullishFloatTx,
  comp_yac_wpa: nullishFloatTx,
  total_home_comp_air_wpa: nullishFloatTx,
  total_away_comp_air_wpa: nullishFloatTx,
  total_home_comp_yac_wpa: nullishFloatTx,
  total_away_comp_yac_wpa: nullishFloatTx,
  total_home_raw_air_wpa: nullishFloatTx,
  total_away_raw_air_wpa: nullishFloatTx,
  total_home_raw_yac_wpa: nullishFloatTx,
  total_away_raw_yac_wpa: nullishFloatTx,
  punt_blocked: boolZ1N,
  first_down_rush: boolZ1N,
  first_down_pass: boolZ1N,
  first_down_penalty: boolZ1N,
  third_down_converted: boolZ1N,
  third_down_failed: boolZ1N,
  fourth_down_converted: boolZ1N,
  fourth_down_failed: boolZ1N,
  incomplete_pass: boolZ1N,
  touchback: boolZ1N,
  interception: boolZ1N,
  punt_inside_twenty: boolZ1N,
  punt_in_endzone: boolZ1N,
  punt_out_of_bounds: boolZ1N,
  punt_downed: boolZ1N,
  punt_fair_catch: boolZ1N,
  kickoff_inside_twenty: boolZ1N,
  kickoff_in_endzone: boolZ1N,
  kickoff_out_of_bounds: boolZ1N,
  kickoff_downed: boolZ1N,
  kickoff_fair_catch: boolZ1N,
  fumble_forced: boolZ1N,
  fumble_not_forced: boolZ1N,
  fumble_out_of_bounds: boolZ1N,
  solo_tackle: boolZ1N,
  safety: boolZ1N,
  penalty: boolZ1N,
  tackled_for_loss: boolZ1N,
  fumble_lost: boolZ1N,
  own_kickoff_recovery: boolZ1N,
  own_kickoff_recovery_td: boolZ1N,
  qb_hit: boolZ1N,
  rush_attempt: boolZ1N,
  pass_attempt: boolZ1N,
  sack: boolZ1N,
  touchdown: boolZ1N,
  pass_touchdown: boolZ1N,
  rush_touchdown: boolZ1N,
  return_touchdown: boolZ1N,
  extra_point_attempt: boolZ1N,
  two_point_attempt: boolZ1N,
  field_goal_attempt: boolZ1N,
  kickoff_attempt: boolZ1N,
  punt_attempt: boolZ1N,
  fumble: boolZ1N,
  complete_pass: boolZ1N,
  assist_tackle: boolZ1N,
  lateral_reception: boolZ1N,
  lateral_rush: boolZ1N,
  lateral_return: boolZ1N,
  lateral_recovery: boolZ1N,
  passer_player_id: nullishString,
  passer_player_name: nullishString,
  passing_yards: nullishFloatTx,
  receiver_player_id: nullishString,
  receiver_player_name: nullishString,
  receiving_yards: nullishFloatTx,
  rusher_player_id: nullishString,
  rusher_player_name: nullishString,
  rushing_yards: nullishFloatTx,
  lateral_receiver_player_id: nullishString,
  lateral_receiver_player_name: nullishString,
  lateral_receiving_yards: nullishFloatTx,
  lateral_rusher_player_id: nullishString,
  lateral_rusher_player_name: nullishString,
  lateral_rushing_yards: nullishFloatTx,
  lateral_sack_player_id: nullishString,
  lateral_sack_player_name: nullishString,
  interception_player_id: nullishString,
  interception_player_name: nullishString,
  lateral_interception_player_id: nullishString,
  lateral_interception_player_name: nullishString,
  punt_returner_player_id: nullishString,
  punt_returner_player_name: nullishString,
  lateral_punt_returner_player_id: nullishString,
  lateral_punt_returner_player_name: nullishString,
  kickoff_returner_player_name: nullishString,
  kickoff_returner_player_id: nullishString,
  lateral_kickoff_returner_player_id: nullishString,
  lateral_kickoff_returner_player_name: nullishString,
  punter_player_id: nullishString,
  punter_player_name: nullishString,
  kicker_player_id: nullishString,
  kicker_player_name: nullishString,
  own_kickoff_recovery_player_id: nullishString,
  own_kickoff_recovery_player_name: nullishString,
  blocked_player_id: nullishString,
  blocked_player_name: nullishString,
  tackle_for_loss_1_player_id: nullishString,
  tackle_for_loss_1_player_name: nullishString,
  tackle_for_loss_2_player_id: nullishString,
  tackle_for_loss_2_player_name: nullishString,
  qb_hit_1_player_id: nullishString,
  qb_hit_1_player_name: nullishString,
  qb_hit_2_player_id: nullishString,
  qb_hit_2_player_name: nullishString,
  forced_fumble_player_1_team: nullishString,
  forced_fumble_player_1_player_id: nullishString,
  forced_fumble_player_1_player_name: nullishString,
  forced_fumble_player_2_team: nullishString,
  forced_fumble_player_2_player_id: nullishString,
  forced_fumble_player_2_player_name: nullishString,
  solo_tackle_1_team: nullishString,
  solo_tackle_1_player_id: nullishString,
  solo_tackle_1_player_name: nullishString,
  solo_tackle_2_team: nullishString,
  solo_tackle_2_player_id: nullishString,
  solo_tackle_2_player_name: nullishString,
  assist_tackle_1_team: nullishString,
  assist_tackle_1_player_id: nullishString,
  assist_tackle_1_player_name: nullishString,
  assist_tackle_2_team: nullishString,
  assist_tackle_2_player_id: nullishString,
  assist_tackle_2_player_name: nullishString,
  assist_tackle_3_team: nullishString,
  assist_tackle_3_player_id: nullishString,
  assist_tackle_3_player_name: nullishString,
  assist_tackle_4_team: nullishString,
  assist_tackle_4_player_id: nullishString,
  assist_tackle_4_player_name: nullishString,
  tackle_with_assist: boolZ1N,
  tackle_with_assist_1_player_id: nullishString,
  tackle_with_assist_1_player_name: nullishString,
  tackle_with_assist_1_team: nullishString,
  tackle_with_assist_2_player_id: nullishString,
  tackle_with_assist_2_player_name: nullishString,
  tackle_with_assist_2_team: nullishString,
  pass_defense_1_player_id: nullishString,
  pass_defense_1_player_name: nullishString,
  pass_defense_2_player_id: nullishString,
  pass_defense_2_player_name: nullishString,
  fumbled_1_team: nullishString,
  fumbled_1_player_id: nullishString,
  fumbled_1_player_name: nullishString,
  fumbled_2_player_id: nullishString,
  fumbled_2_player_name: nullishString,
  fumbled_2_team: nullishString,
  fumble_recovery_1_team: nullishString,
  fumble_recovery_1_player_id: nullishString,
  fumble_recovery_1_player_name: nullishString,
  fumble_recovery_2_team: nullishString,
  fumble_recovery_2_player_id: nullishString,
  fumble_recovery_2_player_name: nullishString,
  fumble_recovery_1_yards: nullishFloatTx,
  fumble_recovery_2_yards: nullishFloatTx,
  sack_player_id: nullishString,
  sack_player_name: nullishString,
  half_sack_1_player_id: nullishString,
  half_sack_1_player_name: nullishString,
  half_sack_2_player_id: nullishString,
  half_sack_2_player_name: nullishString,
  return_team: nullishString,
  return_yards: nullishFloatTx,
  penalty_team: nullishString,
  penalty_player_id: nullishString,
  penalty_player_name: nullishString,
  penalty_yards: nullishFloatTx,
  replay_or_challenge: boolZ1N,
  replay_or_challenge_result: nullishStringSub(z.enum(["reversed", "upheld", "denied"])),
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
  ),
  defensive_two_point_attempt: boolZ1N,
  defensive_two_point_conv: boolZ1N,
  defensive_extra_point_attempt: boolZ1N,
  defensive_extra_point_conv: boolZ1N,
  safety_player_name: nullishString,
  safety_player_id: nullishString,
  season: z.coerce.number().int(),
  cp: nullishFloatTx,
  cpoe: nullishFloatTx,
  series: z.coerce.number(),
  series_success: boolZ1,
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
  ),
  order_sequence: nullishFloatTx,
  start_time: nullishString, // weird DT format: "9/8/24, 13:03:02" (likely M/d/YY, HH:mm:ss)
  time_of_day: nullishString,
  stadium: nullishString,
  weather: nullishString,
  nfl_api_id: nullishString,
  play_clock: nullishString,
  play_deleted: boolZ1N,
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
  ),
  special_teams_play: boolZ1N,
  st_play_type: nullishStringSub(
    z.enum([
      "PENALTY",
      // TODO ?? why is nothing else in the dataset?
    ]),
  ),
  end_clock_time: nullishString,
  end_yard_line: nullishString, // [ABBR YARD] or 50
  fixed_drive: z.coerce.number(),
  fixed_drive_result: z.pipe(
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
  ),
  drive_start_real_time: nullishString,
  drive_play_count: nullishFloatTx,
  drive_time_of_possession: nullishString, // clock time, e.g. 6:00
  drive_first_downs: nullishFloatTx,
  drive_inside20: boolZ1N,
  drive_ended_with_score: boolZ1N,
  drive_quarter_start: nullishFloatTx,
  drive_quarter_end: nullishFloatTx,
  drive_yards_penalized: nullishFloatTx,
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
      "BLOCKED_PUNT,_SAFETY", // TODO this is sucky, why did this happen??
    ]),
  ),
  drive_game_clock_start: nullishString, // clock time like 15:00
  drive_game_clock_end: nullishString,
  drive_start_yard_line: nullishString, // e.g. ARI 40, 50
  drive_end_yard_line: nullishString,
  drive_play_id_started: nullishString,
  drive_play_id_ended: nullishString,
  away_score: z.coerce.number(),
  home_score: z.coerce.number(),
  location: z.pipe(z.coerce.string(), z.enum(["Home", "Neutral"])),
  result: z.coerce.number(),
  total: z.coerce.number(),
  spread_line: z.coerce.number(),
  total_line: z.coerce.number(),
  div_game: boolZ1,
  roof: z.pipe(z.coerce.string(), z.enum(["outdoors", "dome", "closed", "open"])),
  surface: nullishStringSub(
    z.enum([
      "a_turf",
      "grass",
      "sportturf",
      "fieldturf",
      "matrixturf",
      "astroturf",
      "astroplay", // TODO clean this up and merge astro stuff
      "dessograss",
      "grass ",
    ]),
  ),
  temp: nullishFloatTx,
  wind: nullishFloatTx,
  hoam_coach: z.coerce.string(), // full name
  away_coach: z.coerce.string(),
  stadium_id: z.coerce.string(),
  game_stadium: z.coerce.string(),
  aborted_play: boolZ1,
  success: boolZ1N,
  passer: nullishString,
  passer_jersey_number: nullishString,
  rusher: nullishString,
  rusher_jersey_number: nullishString,
  receiver: nullishString,
  receiver_jersey_number: nullishString,
  pass: boolZ1,
  rush: boolZ1,
  first_down: boolZ1N,
  special: boolZ1,
  play: boolZ1,
  passer_id: nullishString,
  rusher_id: nullishString,
  receiver_id: nullishString,
  name: nullishString, // Name of player who made play? idk
  jersey_number: nullishString, // JN of player who made play?
  id: nullishString, // player id !!! not play id!!!
  fantasy_player_name: nullishString,
  fantasy_palyer_id: nullishString,
  fantasy: nullishString, // identical to fantasy player name, weird
  fantasy_id: nullishString, // also seems like fantasy player id? weird
  out_of_bounds: boolZ1,
  home_opening_kickoff: boolZ1,
  qb_epa: nullishFloatTx,
  xyac_epa: nullishFloatTx,
  xyac_mean_yardage: nullishFloatTx,
  xyac_median_yardage: nullishFloatTx,
  xyac_success: nullishFloatTx, // %age 0-1
  xyac_fd: nullishFloatTx, // %age 0-1
  xpass: nullishFloatTx, // %age 0-1
  pass_oe: nullishFloatTx,
});

const ngsPassingSchema = z.object({
  season: z.coerce.number().int(),
  season_type: z.pipe(z.coerce.string(), z.enum(["REG", "POST"])),
  week: z.coerce.number().int(),
  player_display_name: z.coerce.string(),
  player_position: z.pipe(z.coerce.string(), z.enum(["QB", "RB", "FB", "HB", "WR", "TE"])),
  team_abbr: nullishString,
  player_gsis_id: z.coerce.string(),
  player_first_name: z.coerce.string(),
  player_last_name: z.coerce.string(),
  player_jersey_number: z.coerce.string(),
  player_short_name: nullishString,

  avg_time_to_throw: z.coerce.number(),
  avg_completed_air_yards: z.coerce.number(),
  avg_intended_air_yards: z.coerce.number(),
  avg_air_yards_differential: z.coerce.number(),
  aggressiveness: z.coerce.number(),
  max_completed_air_distance: nullishFloatTx,
  avg_air_yards_to_sticks: z.coerce.number(),
  attempts: z.coerce.number(),
  pass_yards: z.coerce.number(),
  pass_touchdowns: z.coerce.number(),
  interceptions: z.coerce.number(),
  passer_rating: z.coerce.number(),
  completions: z.coerce.number(),
  completion_percentage: z.coerce.number(),
  expected_completion_percentage: nullishFloatTx,
  completion_percentage_above_expectation: nullishFloatTx,
  avg_air_distance: nullishFloatTx,
  max_air_distance: nullishFloatTx,
});

const ngsReceivingSchema = z.object({
  season: z.coerce.number().int(),
  season_type: z.pipe(z.coerce.string(), z.enum(["REG", "POST"])),
  week: z.coerce.number().int(),
  player_display_name: z.coerce.string(),
  player_position: z.pipe(z.coerce.string(), z.enum(["QB", "RB", "FB", "HB", "WR", "TE"])),
  team_abbr: nullishString,
  player_gsis_id: z.coerce.string(),
  player_first_name: z.coerce.string(),
  player_last_name: z.coerce.string(),
  player_jersey_number: z.coerce.string(),
  player_short_name: nullishString,

  avg_cushion: nullishFloatTx,
  avg_separation: z.coerce.number(),
  avg_intended_air_yards: z.coerce.number(),
  percent_share_of_intended_air_yards: z.coerce.number(),
  receptions: z.coerce.number(),
  targets: z.coerce.number(),
  catch_percentage: z.coerce.number(),
  yards: nullishFloatTx,
  rec_touchdowns: z.coerce.number(),
  avg_yac: nullishFloatTx,
  avg_expected_yac: nullishFloatTx,
  avg_yac_above_expectation: nullishFloatTx,
});

const ngsRushingSchema = z.object({
  season: z.coerce.number().int(),
  season_type: z.pipe(z.coerce.string(), z.enum(["REG", "POST"])),
  week: z.coerce.number().int(),
  player_display_name: z.coerce.string(),
  player_position: z.pipe(z.coerce.string(), z.enum(["QB", "RB", "FB", "HB", "WR", "TE"])),
  team_abbr: nullishString,
  player_gsis_id: z.coerce.string(),
  player_first_name: z.coerce.string(),
  player_last_name: z.coerce.string(),
  player_jersey_number: z.coerce.string(),
  player_short_name: nullishString,

  efficiency: z.coerce.number(),
  percent_attempts_gte_eight_defenders: z.coerce.number(),
  avg_time_to_los: z.coerce.number(),
  rush_attempts: z.coerce.number(),
  rush_yards: z.coerce.number(),
  avg_rush_yards: z.coerce.number(),
  rush_touchdowns: z.coerce.number(),
  expected_rush_yards: nullishFloatTx,
  rush_yards_over_expected: nullishFloatTx,
  rush_yards_over_expected_per_att: nullishFloatTx,
  rush_pct_over_expected: nullishFloatTx,
});

const injuriesSchema = z.object({
  season: z.coerce.number().int(),
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SB"])),
  team: z.coerce.string(), // abbr
  week: z.coerce.number(),
  gsis_id: z.coerce.string(),
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
  ),
  full_name: z.coerce.string(),
  first_name: z.coerce.string(),
  last_name: z.coerce.string(),
  report_primary_injury: nullishString,
  report_secondary_injury: nullishString,
  report_status: nullishStringSub(z.enum(["Out", "Questionable", "Doubtful", "Probable", "Note"])),
  practice_primary_injury: nullishString,
  practice_secondary_injury: nullishString,
  practice_status: nullishStringSub(
    z.enum([
      "Did Not Participate In Practice",
      "Limited Participation in Practice",
      "Full Participation in Practice",
      "Out (Definitely Will Not Play)",
      "Note",
    ]),
  ),
  date_modified: nullishFloatTx, // ms unix timestamp
});

const depthChartsSchema = z.object({
  season: z.coerce.number().int(),
  club_code: z.coerce.string(),
  week: nullishIntTx,
  game_type: z.pipe(z.coerce.string(), z.enum(["REG", "WC", "DIV", "CON", "SBBYE", "SB"])),
  depth_team: z.coerce.string(),
  last_name: z.coerce.string(),
  first_name: z.coerce.string(),
  football_name: z.coerce.string(),
  formation: z.pipe(z.coerce.string(), z.enum(["Defense", "Special Teams", "Offense"])),
  gsis_id: nullishString,
  jersey_number: nullishString,
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
  ),
  elias_id: nullishString,
  depth_position: nullishString,
  full_name: z.coerce.string(),
});

const combineSchema = z.object({
  season: z.coerce.number().int(),
  draft_year: nullishFloatTx,
  draft_team: nullishString, // full team name
  draft_round: nullishFloatTx,
  draft_ovr: nullishFloatTx,
  pfr_id: nullishString,
  cfb_id: nullishString,
  player_name: z.coerce.string(),
  pos: z.coerce.string(), // enum is OK but dual type players may affect this (e.g. travis hunter)
  school: z.coerce.string(),
  ht: nullishString, // height as foot-inches (e.g. 5-5)
  wt: nullishFloatTx, // lbs
  forty: nullishFloatTx, // seconds
  bench: nullishFloatTx, // number between like 10-50, not sure if lbs, kgs, or what
  vertical: nullishFloatTx, // looks like inches
  broad_jump: nullishFloatTx, // looks like inches
  cone: nullishFloatTx, // seconds
  shuttle: nullishFloatTx, // seconds
});

export const NFLVERSE_TAG_SCHEMA = {
  trades: tradeSchema,
  teams: teamsSchema,
  schedules: gamesSchema,
  stats_team: {
    season: teamStatsSchemaSeason,
    week: teamStatsSchemaWeek,
  },
  stats_player: {
    season: playerStatsSchemaSeason,
    week: playerStatsSchemaWeek,
  },
  ftn_charting: ftnChartingSchema,
  espn: {
    qbrSeasonal: espnQbrSeasonalSchema,
    qbrWeekly: espnQbrWeeklySchema,
  },
};
