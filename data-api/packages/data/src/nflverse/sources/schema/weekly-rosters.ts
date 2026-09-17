import { z } from "zod";
import { nullableInt, nullableFloat, nullableString, nullableStringOf, nullableDate } from "./helpers";

export const rosterWeeklySchema = z.object({
  season: nullableFloat.describe("The season (year) for the roster entry"),
  team: z.string().nullish().describe("The team (Abbreviation) for this roster entry"),
  position: nullableString.describe("The position the player plays on this roster."),
  depth_chart_position: nullableString.describe("The depth chart listed position of this player"),
  jersey_number: z.coerce.string().describe("The jersey number this player wears"),
  status: z.enum([
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
      ])
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
  full_name: z.string().nullish().describe("The player's full name"),
  first_name: z.string().nullish().describe("The player's first name"),
  last_name: z.string().nullish().describe("The player's last name"),
  birth_date: nullableDate.describe("The player's birth date"),
  height: z.coerce.number().describe("The player's height in inches"),
  weight: z.coerce.number().describe("The player's weight in lbs"),
  college: z.string().nullish().describe("The college the player went to"),
  gsis_id: z.string().nullish().describe(
    "The player's GSIS (Game Statistics and Information System) ID, the NFL's internal player identifier",
  ),
  espn_id: nullableString.describe("The player's ESPN ID"),
  sportradar_id: nullableString.describe("The player's SportRadar ID"),
  yahoo_id: nullableString.describe("The player's Yahoo Sports ID"),
  rotowire_id: nullableString.describe("The player's Rotowire ID"),
  pff_id: nullableString.describe("The player's Pro Football Focus ID"),
  pfr_id: nullableString.describe("The player's Pro Football Reference ID"),
  fantasy_data_id: nullableString.describe("The player's Fantasy Data ID"),
  sleeper_id: nullableString.describe("The player's Sleeper ID"),
  years_exp: nullableInt.describe("The number of years the player has been in the league"),
  headshot_url: nullableStringOf(z.url()).describe("The player's headshot image URL"),
  ngs_position: nullableString.describe("The player's NextGenStats position"),
  week: nullableInt.describe("The week this roster entry represents"),
  game_type: nullableStringOf(z.enum(["REG", "DIV", "WC", "CON", "SB"])).describe(
    `The game type for this week's game. Mapping:
REG=Regular season
DIV=Divisional round
WC=Wild Card round
CON=Conference championship
SB=Super Bowl`,
  ),
  status_description_abbr: nullableString.describe("The description (abbr) of this player's status"),
  football_name: nullableString.describe(
    "The name the player goes by for football purposes (their preferred football name)",
  ),
  esb_id: nullableString.describe("The player's ESB ID"),
  gsis_it_id: nullableString.describe(
    "The player's GSIS IT ID (the IT/information-technology system ID used by NFL internal systems, distinct from the standard GSIS player ID)",
  ),
  smart_id: nullableString.describe(
    "The player's SMART ID (the NFL's SMART player ID used for cross-system linking)",
  ),
  entry_year: nullableInt.describe("The year the player entered the league"),
  rookie_year: nullableInt.describe("The player's rookie year"),
  draft_club: nullableString.describe(
    "The team (Abbreviation) of the club which drafted this player. Null = UDFA",
  ),
  draft_number: nullableInt.describe("The position in the draft that this player was taken at"),
});
