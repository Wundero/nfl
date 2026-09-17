import { z } from "zod";
import { nullableInt, nullableFloat, boolFromBinary, nullableString, nullableDate } from "./helpers";

export const histContractsSchema = z.object({
  player: z.string().nullish().describe("Player full name"),
  position: nullableString.describe("Player position: QB=Quarterback, RB=Running Back, FB=Fullback, WR=Wide Receiver, TE=Tight End, LT=Left Tackle, LG=Left Guard, C=Center, RG=Right Guard, RT=Right Tackle, IDL=Interior Defensive Line, ED=Edge Rusher, LB=Linebacker, CB=Cornerback, S=Safety, K=Kicker, P=Punter, LS=Long Snapper"),
  team: z.string().nullish().describe("Team nickname, or slash-separated abbreviations when the contract spanned multiple teams (e.g. 'LAR/SEA')"),
  is_active: boolFromBinary.describe("True if the contract is currently active (0/null/undefined coerce to false)"),
  year_signed: nullableInt.describe("Calendar year in which the contract was signed"),
  years: z.coerce.string().describe("Contract length as a string: either a number of years or the literal 'NA' when not available"),
  value: nullableFloat.describe("Total contract value in USD"),
  apy: nullableFloat.describe("Average per year (APY) contract value in USD"),
  guaranteed: nullableFloat.describe("Guaranteed money in USD"),
  apy_cap_pct: nullableFloat.describe("APY as a percentage of the salary cap in effect when the contract was signed (e.g. 15.2 = 15.2%)"),
  inflated_value: nullableFloat.describe("Total contract value in USD adjusted for salary-cap inflation to current cap dollars"),
  inflated_apy: nullableFloat.describe("Average per year (APY) value in USD adjusted for salary-cap inflation"),
  inflated_guaranteed: nullableFloat.describe("Guaranteed money in USD adjusted for salary-cap inflation"),
  player_page: z.url().describe("OverTheCap player page URL"),
  otc_id: z.coerce.string().describe("OverTheCap player identifier"),
  date_of_birth: nullableDate.describe("Date of birth parsed from OverTheCap's informal value; prefer other sources"),
  height: z.coerce.string().describe("Informal height string in ft'in\" format; ignore in favor of other sources"),
  weight: z.coerce.string().describe("Informal weight string in lbs, may be the literal 'NA'; ignore in favor of other sources"),
  college: z.string().nullish().describe("College attended"),
  draft_year: z.coerce.string().describe("Informal draft year string; ignore in favor of other sources"),
  draft_round: z.coerce.string().describe("Informal draft round string; ignore in favor of other sources"),
  draft_overall: z.coerce.string().describe("Informal overall draft pick number string; ignore in favor of other sources"),
  draft_team: z.string().nullish().describe("Informal drafting team string; ignore in favor of other sources"),
  season_history: z.coerce.string().describe("Concise string of the seasons the player played (informal summary from OverTheCap)"),
  gsis_id: z.string().nullish().describe("The player's GSIS (Game Statistics and Information System) ID"),
  contract_history: z
    .array(
      z.object({
        team: z.string().nullish().describe("Team name for the contract"),
        contract_type: z.string().nullish().describe("How the contract was acquired (e.g. Drafted, Extension)"),
        status: z.string().nullish().describe("Status of the contract (e.g. Active, Expired)"),
        year_signed: nullableInt.describe("Calendar year the contract was signed"),
        yrs: nullableInt.describe("Number of years on the contract"),
        total: nullableFloat.describe("Total contract value in USD"),
        apy: nullableFloat.describe("Average per year (APY) value in USD"),
        guarantees: nullableFloat.describe("Guaranteed money in USD"),
        amount_earned: nullableFloat.describe("Amount earned so far in USD"),
        percent_earned: nullableFloat.describe("Share of the total contract value earned (0-1)"),
        effective_apy: nullableFloat.describe("Effective APY in USD, adjusted for amount earned"),
      }),
    )
    .nullish()
    .describe("OverTheCap contract history entries for this player"),
});
