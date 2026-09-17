import { z } from "zod";
import {
  nullableInt,
  nullableFloat,
  boolFromBinary,
  nullableBoolFromBinary,
  nullableString,
  nullableStringOf,
  hexColor,
  nullableHexColor,
  urlSchema,
  nullableDate,
} from "./helpers";

export const tradeSchema = z
  .object({
    trade_id: nullableInt.describe("The ID of the trade"),
    season: nullableInt.describe("The season (year) when the trade happened"),
    trade_date: nullableDate.describe("The date of the trade"),
    gave: z.string().nullish().describe("The team (Abbreviation) which sent the resource"),
    received: z.string().nullish().describe("The team (Abbreviation) which received the resource"),
    pick_season: nullableInt.describe("The year the draft pick is for. Null = no pick traded."),
    pick_round: nullableInt.describe(
      "The round of the draft the pick is in. Null = no pick traded.",
    ),
    pick_number: nullableInt.describe(
      "The absolute number of the pick in the draft of that year. Null = no pick traded.",
    ),
    conditional: nullableBoolFromBinary.describe(
      "Whether the pick traded is conditional. Null = no pick traded.",
    ),
    pfr_id: nullableString.describe(
      "Pro football reference player ID, if known. Null = either no player traded OR PFR doesn't have this player ID.",
    ),
    pfr_name: nullableString.describe(
      "The name of the player who was traded. Null = no player traded.",
    ),
  })
  .describe("A traded resource (either a player, a pick, or both in one row)");

export const teamsSchema = z
  .object({
    team_abbr: z
      .string()
      .nullish()
      .describe("The team's abbreviation, e.g. ARI = Arizona Cardinals"),
    team_name: z.string().nullish().describe("The team's full name, e.g. Arizona Cardinals"),
    team_id: z.coerce.number().int().describe("The team's nflverse ID, e.g. 3800."),
    team_nick: z.string().nullish().describe("The team's short name, e.g. Cardinals."),
    team_conf: z.string().nullish().describe("The team's conference, e.g. NFC"),
    team_division: z.string().nullish().describe("The team's division, e.g. NFC West"),
    team_color: hexColor.describe("The team's primary color, as a hex color (e.g. #97233F)"),
    team_color2: hexColor.describe("The team's secondary color, as a hex color (e.g. #FFB612)"),
    team_color3: nullableHexColor.describe(
      "The team's tertiary color, as a hex color. Null = no tertiary color defined.",
    ),
    team_color4: nullableHexColor.describe(
      "The team's quaternary color, as a hex color. Null = no quaternary color defined.",
    ),
    team_logo_wikipedia: urlSchema.describe("The team's Wikipedia Logo URI, may be invalid."),
    team_logo_espn: urlSchema.describe("The team's ESPN logo URI"),
    team_wordmark: urlSchema.describe("The team's NFL Verse Wordmark image URI"),
    team_logo_squared: urlSchema.describe("The team's NFL Verse Square Logo image URI"),
    team_conference_logo: urlSchema.describe("The conference's NFL Verse logo URI"),
    team_league_logo: urlSchema.describe("The league's NFL Verse Logo URI"),
  })
  .describe("An NFL team");

export const gamesSchema = z
  .object({
    game_id: z
      .string()
      .nullish()
      .describe(
        "NFL Verse ID of the game, formatted as YEAR_WEEK_AWAYTEAMABBR_HOMETEAMABBR (e.g. 2023_01_ARI_WAS).",
      ),
    season: nullableInt.describe("Season (year) the game took place"),
    // The type of the game. REG = regular season game, WC = wildcard playoff game, DIV = divisional round playoff game,
    //  CON = conference championship game, SB = superbowl game
    game_type: z
      .enum(["REG", "WC", "DIV", "CON", "SB"])
      .describe(
        "The type of game being played. Values: REG=regular season game, " +
          "WC=wildcard playoff game, DIV=divisional round playoff game, CON=conference championship playoff game, SB=superbowl playoff final game",
      ),
    // The week number of the season game, 1..22 or so
    week: nullableInt.describe("The week of the season the game took place (1-22)."),
    // The ISO date of the game
    gameday: nullableDate.describe("The date the game took place."),
    // The day of the week the game was played on
    weekday: z
      .enum(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
      .describe("The day of the week the game took place."),
    // The time of day the game was played on (I think EST? not sure though)
    gametime: nullableString.describe(
      "The scheduled kickoff time of day, in 24-hour HH:MM format. Null = unknown.",
    ),
    // The away team abbreviation
    away_team: z.string().nullish().describe("Team abbreviation of the away team"),
    // The score the away team got (null if not yet played)
    away_score: nullableInt.describe("The score the away team got. Null = not yet played."),
    // The home team abbreviation
    home_team: z.string().nullish().describe("Team abbreviation of the home team"),
    // The score the home team got (null if not yet played)
    home_score: nullableInt.describe("The score the home team got. Null = not yet played."),
    // Where the game was played for the home team (either at home or in a neutral stadium, away inverses to home)
    location: z
      .enum(["Home", "Neutral"])
      .describe("Whether the game was played at home (for the home team) or in a neutral stadium."),
    // Result = home score - away score
    result: nullableInt.describe("The resulting score of the game. Equal to home-away."),
    // Total = home score + away score
    total: nullableInt.describe("Total points scored in the game. Equal to home+away."),
    // Whether the game went into overtime
    overtime: nullableBoolFromBinary.describe("Whether the game went into overtime."),
    // Previously used game ids (one number, YEARMONTHDAYNUMBER, not as obvious what the NUMBER is)
    old_game_id: z.coerce
      .number()
      .int()
      .describe(
        "The previously used NFL Verse game ID, a single number in YEARMONTHDAYNUMBER format; the meaning of the trailing NUMBER is undocumented.",
      ),
    // NFL GSIS ID
    gsis: nullableInt.describe("NFL Game Statistics & Information System (GSIS) ID for the game."),
    // NFL Detail ID (very little use)
    nfl_detail_id: nullableStringOf(z.uuid()).describe("NFL Detail ID for the game."),
    // Pro football reference ID
    pfr: z.string().nullish().describe("Pro Football Reference ID for the game."),
    // Pro football focus ID
    pff: nullableInt.describe("Pro Football Focus ID for the game."),
    // ESPN ID
    espn: z.coerce.number().int().describe("ESPN ID for the game."),
    // For the numbers (fantasy) ID
    ftn: nullableInt.describe("FTN (For The Numbers) ID for the game."),
    // How many days of rest the away team got
    away_rest: nullableInt.describe("Number of days of rest the away team had prior to the game."),
    // How many days of rest the home team got
    home_rest: nullableInt.describe("Number of days of rest the home team had prior to the game."),
    away_moneyline: nullableInt.describe(
      "The American-odds moneyline price for the away team to win outright. Null = no odds available.",
    ),
    home_moneyline: nullableInt.describe(
      "The American-odds moneyline price for the home team to win outright. Null = no odds available.",
    ),
    spread_line: nullableFloat.describe(
      "The point spread for the game, in points. Positive = home team favored. Null = no line available.",
    ),
    away_spread_odds: nullableInt.describe(
      "The American-odds price (vig/juice) on the away team's spread bet, e.g. -110. Null = no odds available.",
    ),
    home_spread_odds: nullableInt.describe(
      "The American-odds price (vig/juice) on the home team's spread bet, e.g. -110. Null = no odds available.",
    ),
    total_line: nullableFloat.describe(
      "The over/under total-points line for the game. Null = no line available.",
    ),
    under_odds: nullableInt.describe(
      "The American-odds price on the under bet (total points below total_line), e.g. -110. Null = no odds available.",
    ),
    over_odds: nullableInt.describe(
      "The American-odds price on the over bet (total points above total_line), e.g. -110. Null = no odds available.",
    ),
    div_game: boolFromBinary.describe(
      "Whether the game is a divisional game (i.e. both teams are in the same division)",
    ),
    roof: nullableStringOf(z.enum(["outdoors", "dome", "closed", "open"])).describe(
      "The roof type of the stadium for the game. Values: outdoors=open-air, dome=fixed roof, closed=retractable roof closed, open=retractable roof open. Null = unknown.",
    ),
    surface: nullableStringOf(
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
    temp: nullableFloat.describe(
      "The temperature of the game, in Fahrenheit. Usually null for indoor games.",
    ),
    wind: nullableFloat.describe(
      "The wind speed during the game, in mph. Usually null for indoor games.",
    ),
    away_qb_id: nullableString.describe("The NFL Verse ID for the away team's quarterback"),
    home_qb_id: nullableString.describe("The NFL Verse ID for the home team's quarterback"),
    home_qb_name: nullableString.describe("The name of the home team's quarterback"),
    away_qb_name: nullableString.describe("The name of the away team's quarterback"),
    away_coach: nullableString.describe("The name of the away team's coach"),
    home_coach: nullableString.describe("The name of the home team's coach"),
    referee: nullableString.describe("The head official (referee) of the game"),
    stadium_id: z.string().nullish().describe("The NFL Verse ID of the stadium for the game"),
    stadium: z.string().nullish().describe("The name of the stadium for the game."),
  })
  .describe("A game entry.");
