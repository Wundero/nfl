import { z } from "zod";
import { nullableInt, nullableFloat, nullableString } from "./helpers";

export const ngsBaseSchema = z.object({
  season: nullableInt.describe("Season year (e.g. 2024)"),
  season_type: z.enum(["REG", "POST"])
    .describe("Season type: REG = regular season, POST = postseason"),
  week: nullableInt.describe("Week number within the season"),
  player_display_name: z.string().nullish().describe("Player's full display name as shown in the feed"),
  player_position: nullableString
    .describe("Player's position: QB, RB, FB, HB, WR, or TE"),
  team_abbr: nullableString.describe("Team abbreviation; null when the player is not currently on a team"),
  player_gsis_id: z.string().nullish().describe("Player's unique NFL GSIS identifier"),
  player_first_name: z.string().nullish().describe("Player's first name"),
  player_last_name: z.string().nullish().describe("Player's last name"),
  player_jersey_number: z.coerce.string().describe("Player's jersey number as a string"),
  player_short_name: nullableString.describe("Player's short name (e.g. 'A.Rodgers'); null if unavailable"),
});

export const ngsPassingSchema = ngsBaseSchema.extend({
  avg_time_to_throw: nullableFloat.describe("Average time from snap to throw in seconds"),
  avg_completed_air_yards: nullableFloat.describe("Average air yards on completed passes"),
  avg_intended_air_yards: nullableFloat.describe(
    "Average intended air yards (air yards to the intended receiver) across all attempts",
  ),
  avg_air_yards_differential: nullableFloat.describe(
    "Average air yards differential: completed air yards minus intended air yards",
  ),
  aggressiveness: nullableFloat.describe(
    "Aggressiveness: share of pass attempts thrown into tight windows (receiver within 1 yard of the nearest defender)",
  ),
  max_completed_air_distance: nullableFloat.describe(
    "Longest completed pass by air distance in yards; null if unavailable",
  ),
  avg_air_yards_to_sticks: nullableFloat.describe("Average air yards to the first-down sticks at the time of the throw"),
  attempts: nullableFloat.describe("Number of pass attempts"),
  pass_yards: nullableFloat.describe("Total passing yards"),
  pass_touchdowns: nullableFloat.describe("Number of passing touchdowns"),
  interceptions: nullableFloat.describe("Number of interceptions thrown"),
  passer_rating: nullableFloat.describe("NFL passer rating"),
  completions: nullableFloat.describe("Number of completed passes"),
  completion_percentage: nullableFloat.describe("Completion percentage (0-100)"),
  expected_completion_percentage: nullableFloat.describe(
    "Model-predicted completion percentage (0-100); null if unavailable",
  ),
  completion_percentage_above_expectation: nullableFloat.describe(
    "Completion percentage above expectation: actual minus expected, in percentage points; null if unavailable",
  ),
  avg_air_distance: nullableFloat.describe("Average air distance of pass attempts in yards; null if unavailable"),
  max_air_distance: nullableFloat.describe("Longest air distance of a pass attempt in yards; null if unavailable"),
});

export const ngsReceivingSchema = ngsBaseSchema.extend({
  avg_cushion: nullableFloat.describe("Average cushion in yards between the receiver and the nearest defender at the snap; null if unavailable"),
  avg_separation: nullableFloat.describe(
    "Average separation in yards between the receiver and the nearest defender at pass arrival",
  ),
  avg_intended_air_yards: nullableFloat.describe("Average intended air yards per target"),
  percent_share_of_intended_air_yards: nullableFloat.describe(
    "Player's share of the team's intended air yards as a percentage (0-100)",
  ),
  receptions: nullableFloat.describe("Number of receptions"),
  targets: nullableFloat.describe("Number of targets"),
  catch_percentage: nullableFloat.describe("Catch percentage: receptions divided by targets (0-100)"),
  yards: nullableFloat.describe("Total receiving yards; null if unavailable"),
  rec_touchdowns: nullableFloat.describe("Number of receiving touchdowns"),
  avg_yac: nullableFloat.describe("Average yards after catch; null if unavailable"),
  avg_expected_yac: nullableFloat.describe("Average expected yards after catch based on the NGS model; null if unavailable"),
  avg_yac_above_expectation: nullableFloat.describe(
    "Average yards after catch above expectation: actual minus expected; null if unavailable",
  ),
});

export const ngsRushingSchema = ngsBaseSchema.extend({
  efficiency: nullableFloat.describe("Rush efficiency: actual rush yards over expected rush yards per attempt"),
  percent_attempts_gte_eight_defenders: nullableFloat.describe(
    "Share of rush attempts against 8 or more defenders in the box, as a percentage (0-100)",
  ),
  avg_time_to_los: nullableFloat.describe("Average time from snap to crossing the line of scrimmage in seconds"),
  rush_attempts: nullableFloat.describe("Number of rush attempts"),
  rush_yards: nullableFloat.describe("Total rushing yards"),
  avg_rush_yards: nullableFloat.describe("Average rush yards per attempt"),
  rush_touchdowns: nullableFloat.describe("Number of rushing touchdowns"),
  expected_rush_yards: nullableFloat.describe("Model-predicted expected rush yards; null if unavailable"),
  rush_yards_over_expected: nullableFloat.describe("Rush yards over expected: actual minus expected; null if unavailable"),
  rush_yards_over_expected_per_att: nullableFloat.describe("Rush yards over expected per attempt; null if unavailable"),
  rush_pct_over_expected: nullableFloat.describe(
    "Share of rush attempts that gained more yards than expected, as a percentage; null if unavailable",
  ),
});
