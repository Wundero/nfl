import { z } from "zod";
import { nullableInt, nullableFloat, nullableString, nullableStringOf } from "./helpers";

export const injuriesSchema = z.object({
  season: nullableInt.describe("Season year (e.g. 2024)"),
  game_type: z
    .enum(["REG", "WC", "DIV", "CON", "SB"])
    .describe(
      "Game type: REG = regular season, WC = wild card, DIV = divisional round, CON = conference championship, SB = Super Bowl",
    ),
  season_type: z
    .enum(["REG", "POST"])
    .describe("Season type: REG = regular season, POST = postseason"),
  team: z.string().nullish().describe("Team abbreviation"),
  week: nullableFloat.describe("Week number within the season"),
  gsis_id: z.string().nullish().describe("Player's unique NFL GSIS identifier"),
  position: nullableString.describe(
    "Player's position abbreviation (e.g. QB, WR, LS); null if unavailable",
  ),
  full_name: z.string().nullish().describe("Player's full name"),
  first_name: z.string().nullish().describe("Player's first name"),
  last_name: z.string().nullish().describe("Player's last name"),
  report_primary_injury: nullableString.describe(
    "Primary injury listed on the official game report; null if none",
  ),
  report_secondary_injury: nullableString.describe(
    "Secondary injury listed on the official game report; null if none",
  ),
  report_status: nullableStringOf(
    z.enum(["Out", "Questionable", "Doubtful", "Probable", "Note"]),
  ).describe(
    "Game-day status from the official injury report: Out, Questionable, Doubtful, Probable, or Note; null if none",
  ),
  practice_primary_injury: nullableString.describe(
    "Primary injury listed on the practice report; null if none",
  ),
  practice_secondary_injury: nullableString.describe(
    "Secondary injury listed on the practice report; null if none",
  ),
  practice_status: nullableStringOf(
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
});
