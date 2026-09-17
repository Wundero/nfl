import { z } from "zod";
import { nullableInt, nullableFloat, nullableString } from "./helpers";

export const combineSchema = z.object({
  season: nullableInt.describe("Season year (e.g. 2024)"),
  draft_year: nullableFloat.describe("Year the player was drafted; null if undrafted"),
  draft_team: nullableString.describe(
    "Full team name of the team that drafted the player; null if undrafted",
  ),
  draft_round: nullableFloat.describe("Round in which the player was drafted; null if undrafted"),
  draft_ovr: nullableFloat.describe(
    "Overall pick number at which the player was drafted; null if undrafted",
  ),
  pfr_id: nullableString.describe(
    "Player's Pro-Football-Reference identifier; null if unavailable",
  ),
  cfb_id: nullableString.describe("Player's College Football identifier; null if unavailable"),
  player_name: z.string().nullish().describe("Player's full name"),
  pos: z
    .string()
    .nullish()
    .describe(
      "Player's position from the combine feed; may be free-form since dual-position players are listed with multiple positions (e.g. 'CB/WR')",
    ),
  school: z.string().nullish().describe("College the player attended at the time of the combine"),
  ht: nullableString.describe("Height as a feet-inches string (e.g. '5-5'); null if unavailable"),
  wt: nullableFloat.describe("Weight in pounds (lbs); null if unavailable"),
  forty: nullableFloat.describe("40-yard dash time in seconds; null if unavailable"),
  bench: nullableFloat.describe(
    "Bench press result from the combine feed (number of reps; units ambiguous in the feed); null if unavailable",
  ),
  vertical: nullableFloat.describe("Vertical jump height in inches; null if unavailable"),
  broad_jump: nullableFloat.describe("Broad jump distance in inches; null if unavailable"),
  cone: nullableFloat.describe("3-cone drill time in seconds; null if unavailable"),
  shuttle: nullableFloat.describe("20-yard shuttle time in seconds; null if unavailable"),
});
