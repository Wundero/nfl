import { z } from "zod";
import { nullableInt, nullableFloat } from "./helpers";

export const teamStatsSchemaBase = z.object({
  // Base info
  season: nullableInt.describe("The season (year) this stat line covers"),
  team: z.string().nullish().describe("The abbreviation of the team this stat line is for"),
  season_type: z.enum(["POST", "REG", "REG+POST"])
    .describe(`The type of game this stat applies to. Mapping:
POST=Postseason games only
REG=Regular season games only
REG+POST=Regular season and postseason games combined`),

  // Standard stats categories
  completions: nullableInt
    .describe("The number of completed passes thrown by this team"),
  attempts: nullableInt.describe("The number of pass attempts by this team"),
  passing_yards: nullableFloat
    .describe("The total passing yards gained by this team on offense"),
  passing_tds: nullableInt
    .describe("The number of passing touchdowns scored by this team"),
  passing_interceptions: nullableInt
    .describe("The number of interceptions thrown by this team while on offense"),
  sacks_suffered: nullableInt
    .describe("The number of times this team's quarterback was sacked"),
  sack_yards_lost: nullableFloat
    .describe("The number of yards this team lost due to sacks"),
  sack_fumbles: nullableInt
    .describe("The number of sacks on this team which resulted in fumbles"),
  sack_fumbles_lost: nullableInt
    .describe("The number of sack-fumbles by this team which were lost to the other team"),
  passing_air_yards: nullableFloat
    .describe("The total air yards on this team's pass attempts (yards the ball traveled in the air before the catch)"),
  passing_yards_after_catch: nullableFloat
    .describe(
      "The total yards gained after the catch on this team's completed passes",
    ),
  passing_first_downs: nullableInt
    .describe("The number of first downs this team achieved using passes"),
  passing_epa: nullableFloat
    .describe("The EPA (expected points added) of this team's passing offense"),
  passing_cpoe: nullableFloat.describe(
    "The CPOE (completion percentage over expected) of this team's pass attempts. Null = not available",
  ),
  passing_2pt_conversions: nullableInt
    .describe("The number of two-point conversions made by this team using passes"),
  passing_10: nullableInt
    .describe("The number of this team's passes resulting in a gain of 10 or more yards"),
  passing_16: nullableInt
    .describe("The number of this team's passes resulting in an explosive (16+ yards) play"),
  passing_20: nullableInt
    .describe("The number of this team's passes resulting in a gain of 20 or more yards"),
  passing_40: nullableInt
    .describe("The number of this team's passes resulting in a gain of 40 or more yards"),
  carries: nullableInt.describe("The number of rushing attempts by this team"),
  rushing_yards: nullableFloat.describe("The total rushing yards gained by this team"),
  rushing_tds: nullableInt
    .describe("The number of rushing touchdowns scored by this team"),
  rushing_fumbles: nullableInt
    .describe("The number of fumbles by this team on rushing plays"),
  rushing_fumbles_lost: nullableInt
    .describe(
      "The number of fumbles by this team on rushing plays which resulted in a turnover",
    ),
  rushing_first_downs: nullableInt
    .describe("The number of first downs gained by this team via rushing"),
  rushing_epa: nullableFloat
    .describe("The EPA (expected points added) of this team's rushing offense"),
  rushing_2pt_conversions: nullableInt
    .describe("The number of two-point conversions made by this team using rushes"),
  rushing_10: nullableInt
    .describe("The number of this team's rushes resulting in a gain of 10 or more yards"),
  rushing_12: nullableInt
    .describe("The number of this team's rushes resulting in an explosive (12+ yards) play"),
  rushing_20: nullableInt
    .describe("The number of this team's rushes resulting in a gain of 20 or more yards"),
  rushing_40: nullableInt
    .describe("The number of this team's rushes resulting in a gain of 40 or more yards"),
  receptions: nullableInt
    .describe("The number of receptions made by this team's receivers"),
  targets: nullableInt
    .describe("The number of times this team's receivers were targeted by a pass"),
  receiving_yards: nullableInt
    .describe("The total receiving yards gained by this team"),
  receiving_tds: nullableInt
    .describe("The number of receiving touchdowns scored by this team"),
  receiving_fumbles: nullableInt
    .describe("The number of fumbles by this team after a reception"),
  receiving_fumbles_lost: nullableInt
    .describe(
      "The number of fumbles by this team after a reception which resulted in a turnover",
    ),
  receiving_air_yards: nullableFloat
    .describe("The total air yards on targets to this team's receivers (yards the ball traveled in the air on the target, regardless of catch)"),
  receiving_yards_after_catch: nullableFloat
    .describe("The total yards this team's receivers gained after the catch"),
  receiving_first_downs: nullableInt
    .describe("The number of first downs gained by this team via receiving"),
  receiving_epa: nullableFloat
    .describe("The EPA (expected points added) of plays targeting this team's receivers"),
  receiving_2pt_conversions: nullableInt
    .describe("The number of two-point conversions made by this team via receptions"),
  receiving_10: nullableInt
    .describe("The number of receptions by this team gaining 10 or more yards"),
  receiving_16: nullableInt
    .describe("The number of receptions by this team resulting in an explosive (16+ yards) play"),
  receiving_20: nullableInt
    .describe("The number of receptions by this team gaining 20 or more yards"),
  receiving_40: nullableInt
    .describe("The number of receptions by this team gaining 40 or more yards"),
  special_teams_tds: nullableInt
    .describe(
      "The number of touchdowns scored by this team on special teams (punt/kickoff return tds, blocked fg return tds)",
    ),
  def_tackles_solo: nullableFloat
    .describe("The number of solo tackles made by this team's defense"),
  def_tackles_with_assist: nullableFloat
    .describe("The number of combined tackles made by this team's defense (solo plus assisted)"),
  def_tackle_assists: nullableFloat
    .describe("The number of tackle assists made by this team's defense"),
  def_tackles_for_loss: nullableFloat
    .describe("The number of tackles for loss made by this team's defense"),
  def_tackles_for_loss_yards: nullableFloat
    .describe(
      "The total yards the opposing offense lost on tackles for loss by this team's defense",
    ),
  def_fumbles_forced: nullableInt
    .describe("The number of fumbles forced by this team's defense"),
  def_sacks: nullableFloat
    .describe("The number of sacks recorded by this team's defense (0.5 for half sacks)"),
  def_sack_yards: nullableFloat
    .describe("The total yards the opposing offense lost on sacks by this team's defense"),
  def_qb_hits: nullableFloat
    .describe("The number of quarterback hits recorded by this team's defense"),
  def_interceptions: nullableFloat
    .describe("The number of interceptions caught by this team's defense"),
  def_interception_yards: nullableFloat
    .describe("The total yards returned on interceptions by this team's defense"),
  def_pass_defended: nullableFloat
    .describe("The number of passes defended (broken up) by this team's defense"),
  def_tds: nullableFloat
    .describe("The number of defensive touchdowns scored by this team (pick-6 or fumble return td)"),
  def_fumbles: nullableFloat
    .describe("The number of opponent fumbles recovered by this team's defense"),
  def_safeties: nullableFloat
    .describe("The number of safeties forced by this team's defense"),
  def_punt_blocks: nullableFloat.describe("The number of punts blocked by this team"),
  def_pat_blocks: nullableFloat
    .describe("The number of PAT kicks (1pt kick after touchdown) blocked by this team"),
  def_fg_blocks: nullableFloat
    .describe("The number of field goal attempts blocked by this team"),
  def_2pt_atts: nullableFloat
    .describe("The number of 2pt conversion attempts made against this team's defense"),
  def_2pt_made: nullableFloat
    .describe("The number of 2pt conversions the opposing offense succeeded on against this team's defense"),
  misc_yards: nullableFloat.describe("The number of miscellaneous yards gained by this team"),
  fumble_recovery_own: nullableFloat
    .describe("The number of this team's own fumbles that this team recovered"),
  fumble_recovery_yards_own: nullableFloat
    .describe("The total yards gained on recoveries of this team's own fumbles"),
  fumble_recovery_opp: nullableFloat
    .describe("The number of opponent fumbles recovered by this team"),
  fumble_recovery_yards_opp: nullableFloat
    .describe("The total yards gained on recoveries of opponent fumbles by this team"),
  fumble_recovery_tds: nullableFloat
    .describe("The number of touchdowns scored by this team on fumble recoveries"),
  penalties: nullableFloat.describe("The number of penalties incurred by this team"),
  penalty_yards: nullableFloat.describe("The total yards lost by this team due to penalties"),
  timeouts: nullableFloat.describe("The number of timeouts taken by this team"),
  fumbles_forced_by_opp: nullableFloat
    .describe("The number of this team's fumbles that were forced by the opposing defense"),
  fumbles_not_forced: nullableFloat
    .describe("The number of this team's fumbles that were unforced"),
  fumbles_out_of_bounds: nullableFloat
    .describe("The number of this team's fumbles that went out of bounds"),
  fumbles_total: nullableFloat.describe("The total count of fumbles by this team"),
  fumbles_lost_total: nullableFloat
    .describe("The total count of fumbles by this team lost to the opposing team"),
  punt_returns: nullableFloat
    .describe("The number of times this team returned a punt any distance"),
  punt_return_yards: nullableFloat
    .describe("The total yards gained by this team on punt returns"),
  kickoff_returns: nullableFloat
    .describe("The number of times this team returned a kickoff any distance"),
  kickoff_return_yards: nullableFloat
    .describe("The total yards gained by this team on kickoff returns"),
  fg_made: nullableFloat.describe("The number of field goals made by this team"),
  fg_att: nullableFloat.describe("The number of field goals attempted by this team"),
  fg_missed: nullableFloat.describe("The number of field goals missed by this team"),
  fg_blocked: nullableFloat
    .describe("The number of this team's field goal attempts which were blocked"),
  fg_long: nullableFloat.describe(
    "The longest field goal made by this team (in yards). Null = no field goals made",
  ),
  fg_pct: nullableFloat.describe(
    "The field goal make percentage of this team (fraction, 0-1). Null = no field goal attempts",
  ),
  fg_made_0_19: nullableFloat
    .describe("The number of field goals made by this team from 0 to 19 yards"),
  fg_made_20_29: nullableFloat
    .describe("The number of field goals made by this team from 20 to 29 yards"),
  fg_made_30_39: nullableFloat
    .describe("The number of field goals made by this team from 30 to 39 yards"),
  fg_made_40_49: nullableFloat
    .describe("The number of field goals made by this team from 40 to 49 yards"),
  fg_made_50_59: nullableFloat
    .describe("The number of field goals made by this team from 50 to 59 yards"),
  fg_made_60_: nullableFloat
    .describe("The number of field goals made by this team from 60 or more yards"),
  fg_missed_0_19: nullableFloat
    .describe("The number of field goals missed by this team from 0 to 19 yards"),
  fg_missed_20_29: nullableFloat
    .describe("The number of field goals missed by this team from 20 to 29 yards"),
  fg_missed_30_39: nullableFloat
    .describe("The number of field goals missed by this team from 30 to 39 yards"),
  fg_missed_40_49: nullableFloat
    .describe("The number of field goals missed by this team from 40 to 49 yards"),
  fg_missed_50_59: nullableFloat
    .describe("The number of field goals missed by this team from 50 to 59 yards"),
  fg_missed_60_: nullableFloat
    .describe("The number of field goals missed by this team from 60 or more yards"),
  fg_made_list: z.coerce.string()
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
  fg_missed_list: z.coerce.string()
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
  fg_blocked_list: z.coerce.string()
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
  fg_made_distance: nullableFloat
    .describe("The total yardage covered by field goals made by this team"),
  fg_missed_distance: nullableFloat
    .describe("The total yardage covered by field goals missed by this team"),
  fg_blocked_distance: nullableFloat
    .describe("The total yardage of this team's field goals which were blocked"),
  pat_made: nullableFloat.describe("The number of extra point (PAT) kicks made by this team"),
  pat_att: nullableFloat
    .describe("The number of extra point (PAT) kicks attempted by this team"),
  pat_missed: nullableFloat
    .describe("The number of extra point (PAT) kicks missed by this team"),
  pat_blocked: nullableFloat
    .describe("The number of extra point (PAT) kicks by this team that were blocked"),
  pat_pct: nullableFloat.describe(
    "The extra point (PAT) make percentage of this team (fraction, 0-1). Null = no PAT attempts",
  ),
  gwfg_made: nullableFloat
    .describe("The number of game winning field goals made by this team"),
  gwfg_att: nullableFloat
    .describe("The number of game winning field goals attempted by this team"),
  gwfg_missed: nullableFloat
    .describe("The number of game winning field goals missed by this team"),
  gwfg_blocked: nullableFloat
    .describe("The number of game winning field goals by this team that were blocked"),
  pt_att: nullableFloat.describe("The number of punts attempted by this team"),
  pt_blocked: nullableFloat
    .describe("The number of attempted punts by this team that were blocked"),
  pt_long: nullableFloat.describe("The longest punt by this team (in yards)"),
  pt_yards: nullableFloat.describe("The total (gross) yardage of this team's punts"),
  pt_inside_20: nullableFloat
    .describe("The number of this team's punts which ended up inside the opponent's 20 yard line"),
  pt_out_of_bounds: nullableFloat
    .describe("The number of this team's punts which ended up out of bounds"),
  pt_downed: nullableFloat
    .describe("The number of this team's punts that the punting team downed"),
  pt_touchback: nullableFloat
    .describe("The number of this team's punts which resulted in a touchback"),
  pt_fair_caught: nullableFloat
    .describe("The number of this team's punts where the returner fair-caught the ball"),
  pt_returned: nullableFloat
    .describe("The number of this team's punts where the returner returned the ball any distance"),
  pt_return_yards: nullableFloat
    .describe("The total yards conceded to punt returns on this team's punts"),
  pt_return_tds: nullableFloat
    .describe("The number of punt return touchdowns conceded on this team's punts"),
  pt_net_yards: nullableFloat
    .describe("The net punt yardage by this team (gross punt yards - return yards)"),
});

export const teamStatsSchemaSeason = teamStatsSchemaBase.extend({
  games: nullableInt.describe("The number of games this team played this season"),
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
});

export const teamStatsSchemaWeek = teamStatsSchemaBase.extend({
  week: nullableFloat.describe("The week of the season in which this game happened"),
  game_id: z.string().nullish().describe(
    "The NFL Verse game identifier of the game this stat line is for (e.g., 2023_01_KC_DET)",
  ),
  opponent_team: z.string().nullish()
    .describe("The abbreviation of the team this team faced in this game"),
  gwfg_distance: nullableInt.describe(
    "The distance (in yards) of this team's game winning field goal attempt; null when unavailable",
  ),
});
