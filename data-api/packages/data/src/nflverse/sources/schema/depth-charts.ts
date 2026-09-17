import { z } from "zod";
import { nullableInt, nullableString, nullableDate } from "./helpers";

export const depthChartsLegacySchema = z.object({
  season: nullableInt.describe("Season year (e.g. 2024)"),
  club_code: z.string().nullish().describe("Team abbreviation (club code)"),
  week: nullableInt.describe("Week number within the season; null when not applicable"),
  game_type: z.enum(["REG", "WC", "DIV", "CON", "SBBYE", "SB"])
    .describe(
      "Game type: REG = regular season, WC = wild card, DIV = divisional round, CON = conference championship, SBBYE = Super Bowl bye week, SB = Super Bowl",
    ),
  depth_team: z.string().nullish().describe("Team name this depth-chart row belongs to"),
  last_name: z.string().nullish().describe("Player's last name"),
  first_name: z.string().nullish().describe("Player's first name"),
  football_name: z.string().nullish().describe("Player's football name as listed on the depth chart"),
  formation: z.enum(["Defense", "Special Teams", "Offense"])
    .describe("Which side of the ball this depth-chart row is for: Defense, Special Teams, or Offense"),
  gsis_id: nullableString.describe("Player's unique NFL GSIS identifier; null if unavailable"),
  jersey_number: nullableString.describe("Player's jersey number as a string; null if unavailable"),
  position: nullableString.describe("Normalized position label (e.g. QB, WR, NT); UK = unknown"),
  elias_id: nullableString.describe("Player's Elias Sports Bureau identifier; null if unavailable"),
  depth_position: nullableString.describe(
    "Free-form depth-chart position label as printed on the chart (e.g. 'LWR', 'RDE'); distinct from the normalized position field",
  ),
  full_name: z.string().nullish().describe("Player's full name"),
});

export const depthChartsSchema = z.object({
  dt: nullableDate.describe("Snapshot timestamp for this depth chart (ISO 8601)"),
  team: z.string().nullish().describe("Team abbreviation"),
  player_name: z.string().nullish().describe("Player's full name"),
  espn_id: z.string().nullish().describe("Player's ESPN ID"),
  gsis_id: z.string().nullish().describe("Player's unique NFL GSIS identifier"),
  pos_grp_id: z.string().nullish().describe("Position group ID"),
  pos_grp: z.string().nullish().describe("Position group name (e.g. 'Base 4-3 D')"),
  pos_id: z.string().nullish().describe("Position ID"),
  pos_name: z.string().nullish().describe("Position name (e.g. 'Left Defensive End')"),
  pos_abb: z.string().nullish().describe("Position abbreviation (e.g. 'LDE')"),
  pos_slot: nullableInt.describe("Depth slot at the position (1 = starter)"),
  pos_rank: nullableInt.describe("Overall rank within the position group"),
});
