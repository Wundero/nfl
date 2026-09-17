import { z } from "zod";
import { nullableFloat, boolFromBinary, nullableStringOf } from "./helpers";

export const espnQbrSeasonalSchema = z.object({
  season: nullableFloat.describe("The season (year) for this qb's rating"),
  season_type: z.enum(["Regular", "Playoffs"])
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
  team_abb: z.string().nullish().describe("The team (Abbreviation) this player played for"),
  player_id: z.string().nullish().describe("The (NFL Verse or ESPN, idk) Player ID"),
  name_short: z.string().nullish().describe("The shortened player name"),
  rank: nullableFloat.describe("The player's rank, relative to the other qbs"),
  qbr_total: nullableFloat.describe("The player's total QBR"),
  pts_added: nullableFloat.describe("The number of points this qb contributed"),
  qb_plays: nullableFloat.describe("The number of plays this QB ran"),
  epa_total: nullableFloat.describe("The effective points added by this player"),
  pass: nullableFloat.describe("The player's passing QBR"),
  run: nullableFloat.describe("The player's rushing QBR"),
  exp_sack: nullableFloat.describe(
    "The expected sacks component of the QBR formula (sacks the QB was expected to take based on the play context)",
  ),
  penalty: nullableFloat.describe("The penalty component of the QBR formula (penalty EPA attributed to the QB)"),
  qbr_raw: nullableFloat.describe("The raw QBR for this player"),
  sack: nullableFloat.describe("The sack component of the QBR formula (EPA lost on sacks, split between QB fault and OL/other fault)"),
  name_first: z.string().nullish().describe("The player's first name"),
  name_last: z.string().nullish().describe("The player's last name"),
  name_display: z.string().nullish().describe("The player's display name"),
  headshot_href: nullableStringOf(z.url()).describe("The player's headshot image URI"),
  team: z.string().nullish().describe("The team (nickname) this player played for"),
  qualified: boolFromBinary.describe(
    "Whether the QB met the minimum-play threshold to have a qualified (official) QBR ranking",
  ),
});

export const espnQbrWeeklySchema = espnQbrSeasonalSchema.extend({
  // Different:
  game_id: z.string().nullish().describe("The ESPN game ID"),
  week_text: z.string().nullish().describe("The text description of the game week (e.g. 'Week 1' or 'Wild Card')"),
  opp_id: z.string().nullish().describe("The ESPN team ID of the opponent"),
  opp_abb: z.string().nullish().describe("The abbreviation of the opposing team"),
  opp_team: z.string().nullish().describe("The full team name (city + nickname) of the opponent"),
  opp_name: z.string().nullish().describe("The nickname of the opposing team"),
  week_num: nullableFloat.describe("The week number of the game"),
});
