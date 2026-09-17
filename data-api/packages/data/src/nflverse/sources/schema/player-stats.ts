import { z } from "zod";
import { nullableInt, nullableFloat, nullableString, nullableStringOf } from "./helpers";

export const playerStatsSchemaBase = z.object({
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
  player_display_name: z.string().nullish().describe("The full/display name of the player"),
  position: nullableString.describe(`The position the player plays. Mapping:
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
  position_group: nullableString.describe(`The position group the player plays in. Mapping:
DB=Defensive backs (Corners, safeties)
DL=Defensive line (DT, DE, NT)
QB=Quarterbacks
LB=Linebackers
TE=Tight ends
RB=Runningbacks, Fullbacks
SPEC=Special teams (K, P)
WR=Receivers
OL=Offensive line`),
  headshot_url: nullableStringOf(z.url()).describe(
    "The URL of the player's headshot image. Null = no headshot available",
  ),
  season: nullableInt.describe("The season (year) this stat line covers"),
  season_type: z.enum(["POST", "REG", "REG+POST"])
    .describe(`The type of game this stat applies to. Mapping:
POST=Postseason games only
REG=Regular season games only
REG+POST=Regular season and postseason games combined`),

  // Standard stats categories
  completions: nullableInt.describe("The number of completed passes this player threw"),
  attempts: nullableInt.describe("The number of pass attempts by this player"),
  passing_yards: nullableFloat.describe("The total passing yards gained on this player's passes"),
  passing_tds: nullableInt.describe("The number of passing touchdowns thrown by this player"),
  passing_interceptions: nullableInt.describe("The number of interceptions thrown by this player"),
  sacks_suffered: nullableInt.describe(
    "The number of times this player was sacked (as the passer)",
  ),
  sack_yards_lost: nullableFloat.describe("The number of yards this player lost due to sacks"),
  sack_fumbles: nullableInt.describe(
    "The number of sacks on this player which resulted in fumbles",
  ),
  sack_fumbles_lost: nullableInt.describe(
    "The number of sack-fumbles by this player which were lost to the opposing team",
  ),
  passing_air_yards: nullableFloat.describe(
    "The total air yards on this player's pass attempts (yards the ball traveled in the air before the catch)",
  ),
  passing_yards_after_catch: nullableFloat.describe(
    "The total yards gained after the catch by receivers on this player's completed passes",
  ),
  passing_first_downs: nullableInt.describe(
    "The number of first downs achieved on this player's passing plays",
  ),
  passing_epa: nullableFloat.describe(
    "The EPA (expected points added) of this player's passing plays",
  ),
  passing_cpoe: nullableFloat.describe(
    "The CPOE (completion percentage over expected) of this player's pass attempts. Null = not available",
  ),
  passing_2pt_conversions: nullableInt.describe(
    "The number of successful two-point conversion passes thrown by this player",
  ),
  pacr: nullableFloat.describe(
    "The passing air conversion ratio (PACR) of this player: passing yards divided by passing air yards. Values above 1.0 mean yards after the catch contributed to the player's passing totals",
  ),
  passing_10: nullableInt.describe(
    "The number of this player's passes resulting in a gain of 10 or more yards",
  ),
  passing_16: nullableInt.describe(
    "The number of this player's passes resulting in an explosive (16+ yards) play",
  ),
  passing_20: nullableInt.describe(
    "The number of this player's passes resulting in a gain of 20 or more yards",
  ),
  passing_40: nullableInt.describe(
    "The number of this player's passes resulting in a gain of 40 or more yards",
  ),
  carries: nullableInt.describe("The number of rushing attempts by this player"),
  rushing_yards: nullableFloat.describe("The total rushing yards gained by this player"),
  rushing_tds: nullableInt.describe("The number of rushing touchdowns scored by this player"),
  rushing_fumbles: nullableInt.describe("The number of fumbles by this player on rushing plays"),
  rushing_fumbles_lost: nullableInt.describe(
    "The number of fumbles by this player on rushing plays which were lost to the opposing team",
  ),
  rushing_first_downs: nullableInt.describe(
    "The number of first downs achieved by this player on rushing plays",
  ),
  rushing_epa: nullableFloat.describe(
    "The EPA (expected points added) of this player's rushing plays",
  ),
  rushing_2pt_conversions: nullableInt.describe(
    "The number of successful two-point conversion rushes by this player",
  ),
  rushing_10: nullableInt.describe(
    "The number of this player's rushes resulting in a gain of 10 or more yards",
  ),
  rushing_12: nullableInt.describe(
    "The number of this player's rushes resulting in an explosive (12+ yards) play",
  ),
  rushing_20: nullableInt.describe(
    "The number of this player's rushes resulting in a gain of 20 or more yards",
  ),
  rushing_40: nullableInt.describe(
    "The number of this player's rushes resulting in a gain of 40 or more yards",
  ),
  receptions: nullableInt.describe("The number of receptions by this player"),
  targets: nullableInt.describe("The number of times this player was targeted by a pass"),
  receiving_yards: nullableInt.describe("The total receiving yards gained by this player"),
  receiving_tds: nullableInt.describe("The number of receiving touchdowns scored by this player"),
  receiving_fumbles: nullableInt.describe("The number of fumbles by this player after a reception"),
  receiving_fumbles_lost: nullableInt.describe(
    "The number of fumbles by this player after a reception which were lost to the opposing team",
  ),
  receiving_air_yards: nullableFloat.describe(
    "The total air yards on targets to this player (yards the ball traveled in the air on the target, regardless of catch)",
  ),
  receiving_yards_after_catch: nullableFloat.describe(
    "The total yards this player gained after the catch",
  ),
  receiving_first_downs: nullableInt.describe(
    "The number of first downs achieved by this player on receptions",
  ),
  receiving_epa: nullableFloat.describe(
    "The EPA (expected points added) of plays targeting this player",
  ),
  receiving_2pt_conversions: nullableInt.describe(
    "The number of successful two-point conversion receptions by this player",
  ),
  receiving_10: nullableInt.describe(
    "The number of receptions by this player gaining 10 or more yards",
  ),
  receiving_16: nullableInt.describe(
    "The number of receptions by this player resulting in an explosive (16+ yards) play",
  ),
  receiving_20: nullableInt.describe(
    "The number of receptions by this player gaining 20 or more yards",
  ),
  receiving_40: nullableInt.describe(
    "The number of receptions by this player gaining 40 or more yards",
  ),
  racr: nullableFloat.describe(
    "The receiving air conversion ratio (RACR) of this player: receiving yards divided by the player's air yards on targets. Values above 1.0 mean yards after the catch contributed to the player's receiving totals",
  ),
  target_share: nullableFloat.describe(
    "The player's share of the team's total pass targets (fraction, 0-1)",
  ),
  air_yards_share: nullableFloat.describe(
    "The player's share of the team's total intended air yards (fraction, 0-1)",
  ),
  wopr: nullableFloat.describe(
    "The weighted opportunity rating (WOPR) of this player: a single opportunity metric combining target share and air yards share (1.5 * target_share + 0.7 * air_yards_share)",
  ),
  special_teams_tds: nullableInt.describe(
    "The number of touchdowns scored by this player on special teams (punt/kickoff return tds, blocked fg return tds)",
  ),
  def_tackles_solo: nullableFloat.describe(
    "The number of solo tackles made by this player on defense",
  ),
  def_tackles_with_assist: nullableFloat.describe(
    "The number of combined tackles made by this player on defense (solo plus assisted)",
  ),
  def_tackle_assists: nullableFloat.describe(
    "The number of tackle assists made by this player on defense",
  ),
  def_tackles_for_loss: nullableFloat.describe(
    "The number of tackles for loss made by this player on defense",
  ),
  def_tackles_for_loss_yards: nullableFloat.describe(
    "The total yards the opposing offense lost on this player's tackles for loss",
  ),
  def_fumbles_forced: nullableInt.describe(
    "The number of fumbles forced by this player on defense",
  ),
  def_sacks: nullableFloat.describe(
    "The number of sacks recorded by this player on defense (0.5 for half sacks)",
  ),
  def_sack_yards: nullableFloat.describe(
    "The total yards the opposing offense lost on sacks by this player",
  ),
  def_qb_hits: nullableFloat.describe(
    "The number of quarterback hits recorded by this player on defense",
  ),
  def_interceptions: nullableFloat.describe(
    "The number of interceptions caught by this player on defense",
  ),
  def_interception_yards: nullableFloat.describe(
    "The total yards returned on interceptions by this player",
  ),
  def_pass_defended: nullableFloat.describe(
    "The number of passes defended (broken up) by this player",
  ),
  def_tds: nullableFloat.describe(
    "The number of defensive touchdowns scored by this player (pick-6 or fumble return td)",
  ),
  def_fumbles: nullableFloat.describe(
    "The number of opponent fumbles recovered by this player on defense",
  ),
  def_safeties: nullableFloat.describe("The number of safeties recorded by this player's defense"),
  def_punt_blocks: nullableFloat.describe("The number of punts blocked by this player"),
  def_pat_blocks: nullableFloat.describe(
    "The number of PAT kicks (1pt kick after touchdown) blocked by this player",
  ),
  def_fg_blocks: nullableFloat.describe("The number of field goal attempts blocked by this player"),
  def_2pt_atts: nullableFloat.describe(
    "The number of 2pt conversion attempts against this player's defense",
  ),
  def_2pt_made: nullableFloat.describe(
    "The number of 2pt conversions the opposing offense succeeded on against this player's defense",
  ),
  misc_yards: nullableFloat.describe("The number of miscellaneous yards gained by this player"),
  fumble_recovery_own: nullableFloat.describe(
    "The number of this player's own fumbles that were recovered by this player's team",
  ),
  fumble_recovery_yards_own: nullableFloat.describe(
    "The total yards gained on recoveries of this player's own fumbles",
  ),
  fumble_recovery_opp: nullableFloat.describe(
    "The number of opponent fumbles recovered by this player",
  ),
  fumble_recovery_yards_opp: nullableFloat.describe(
    "The total yards gained on recoveries of opponent fumbles by this player",
  ),
  fumble_recovery_tds: nullableFloat.describe(
    "The number of touchdowns scored by this player on fumble recoveries",
  ),
  penalties: nullableFloat.describe("The number of penalties called on this player"),
  penalty_yards: nullableFloat.describe("The total yards penalized against this player"),
  timeouts: nullableFloat.describe("The number of timeouts taken by this player"),
  fumbles_forced_by_opp: nullableFloat.describe(
    "The number of this player's fumbles that were forced by the opposing defense",
  ),
  fumbles_not_forced: nullableFloat.describe(
    "The number of this player's fumbles that were unforced",
  ),
  fumbles_out_of_bounds: nullableFloat.describe(
    "The number of this player's fumbles that went out of bounds",
  ),
  fumbles_total: nullableFloat.describe("The total count of fumbles by this player"),
  fumbles_lost_total: nullableFloat.describe(
    "The total count of fumbles by this player lost to the opposing team",
  ),
  punt_returns: nullableFloat.describe(
    "The number of times this player returned a punt any distance",
  ),
  punt_return_yards: nullableFloat.describe(
    "The total yards gained by this player on punt returns",
  ),
  kickoff_returns: nullableFloat.describe(
    "The number of times this player returned a kickoff any distance",
  ),
  kickoff_return_yards: nullableFloat.describe(
    "The total yards gained by this player on kickoff returns",
  ),
  fg_made: nullableFloat.describe("The number of field goals made by this player"),
  fg_att: nullableFloat.describe("The number of field goals attempted by this player"),
  fg_missed: nullableFloat.describe("The number of field goals missed by this player"),
  fg_blocked: nullableFloat.describe(
    "The number of this player's field goal attempts which were blocked",
  ),
  fg_long: nullableFloat.describe(
    "The longest field goal made by this player (in yards). Null = no field goals made",
  ),
  fg_pct: nullableFloat.describe(
    "The field goal make percentage of this player (fraction, 0-1). Null = no field goal attempts",
  ),
  fg_made_0_19: nullableFloat.describe(
    "The number of field goals made by this player from 0 to 19 yards",
  ),
  fg_made_20_29: nullableFloat.describe(
    "The number of field goals made by this player from 20 to 29 yards",
  ),
  fg_made_30_39: nullableFloat.describe(
    "The number of field goals made by this player from 30 to 39 yards",
  ),
  fg_made_40_49: nullableFloat.describe(
    "The number of field goals made by this player from 40 to 49 yards",
  ),
  fg_made_50_59: nullableFloat.describe(
    "The number of field goals made by this player from 50 to 59 yards",
  ),
  fg_made_60_: nullableFloat.describe(
    "The number of field goals made by this player from 60 or more yards",
  ),
  fg_missed_0_19: nullableFloat.describe(
    "The number of field goals missed by this player from 0 to 19 yards",
  ),
  fg_missed_20_29: nullableFloat.describe(
    "The number of field goals missed by this player from 20 to 29 yards",
  ),
  fg_missed_30_39: nullableFloat.describe(
    "The number of field goals missed by this player from 30 to 39 yards",
  ),
  fg_missed_40_49: nullableFloat.describe(
    "The number of field goals missed by this player from 40 to 49 yards",
  ),
  fg_missed_50_59: nullableFloat.describe(
    "The number of field goals missed by this player from 50 to 59 yards",
  ),
  fg_missed_60_: nullableFloat.describe(
    "The number of field goals missed by this player from 60 or more yards",
  ),
  fg_made_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of field goals made by this player, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_missed_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of field goals missed by this player, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_blocked_list: z.coerce
    .string()
    .transform((l) => {
      if (!l.trim()) {
        return [];
      }
      const parts = l.split(";");
      return parts.map(Number.parseFloat).filter((n) => !Number.isNaN(n));
    })
    .describe(
      "The distances (in yards) of this player's field goal attempts that were blocked, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
  fg_made_distance: nullableFloat.describe(
    "The total yardage covered by field goals made by this player",
  ),
  fg_missed_distance: nullableFloat.describe(
    "The total yardage covered by field goals missed by this player",
  ),
  fg_blocked_distance: nullableFloat.describe(
    "The total yardage of this player's field goals which were blocked",
  ),
  pat_made: nullableFloat.describe("The number of extra point (PAT) kicks made by this player"),
  pat_att: nullableFloat.describe("The number of extra point (PAT) kicks attempted by this player"),
  pat_missed: nullableFloat.describe("The number of extra point (PAT) kicks missed by this player"),
  pat_blocked: nullableFloat.describe(
    "The number of extra point (PAT) kicks by this player that were blocked",
  ),
  pat_pct: nullableFloat.describe(
    "The extra point (PAT) make percentage of this player (fraction, 0-1). Null = no PAT attempts",
  ),
  gwfg_made: nullableFloat.describe("The number of game winning field goals made by this player"),
  gwfg_att: nullableFloat.describe(
    "The number of game winning field goals attempted by this player",
  ),
  gwfg_missed: nullableFloat.describe(
    "The number of game winning field goals missed by this player",
  ),
  gwfg_blocked: nullableFloat.describe(
    "The number of game winning field goals by this player that were blocked",
  ),
  pt_att: nullableFloat.describe("The number of punts attempted by this player"),
  pt_blocked: nullableFloat.describe(
    "The number of attempted punts by this player that were blocked",
  ),
  pt_long: nullableFloat.describe("The longest punt by this player (in yards)"),
  pt_yards: nullableFloat.describe("The total (gross) yardage of this player's punts"),
  pt_inside_20: nullableFloat.describe(
    "The number of this player's punts which ended up inside the opponent's 20 yard line",
  ),
  pt_out_of_bounds: nullableFloat.describe(
    "The number of this player's punts which ended up out of bounds",
  ),
  pt_downed: nullableFloat.describe(
    "The number of this player's punts that the punting team downed",
  ),
  pt_touchback: nullableFloat.describe(
    "The number of this player's punts which resulted in a touchback",
  ),
  pt_fair_caught: nullableFloat.describe(
    "The number of this player's punts where the returner fair-caught the ball",
  ),
  pt_returned: nullableFloat.describe(
    "The number of this player's punts where the returner returned the ball any distance",
  ),
  pt_return_yards: nullableFloat.describe(
    "The total yards conceded to punt returns on this player's punts",
  ),
  pt_return_tds: nullableFloat.describe(
    "The number of punt return touchdowns conceded on this player's punts",
  ),
  pt_net_yards: nullableFloat.describe(
    "The net punt yardage by this player (gross punt yards - return yards)",
  ),
  fantasy_points: nullableFloat.describe("The fantasy points scored by this player"),
  fantasy_points_ppr: nullableFloat.describe(
    "The fantasy points scored by this player under PPR (points per reception) scoring",
  ),
});

export const playerStatsSchemaSeason = playerStatsSchemaBase.extend({
  games: nullableInt.describe("The number of games this player played in this season"),
  recent_team: z
    .string()
    .nullish()
    .describe("The abbreviation of the team this player most recently played for"),
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
      "The distances (in yards) of game winning field goal attempts by this player, parsed from a semicolon-delimited string into an array of numbers. Empty string = empty array",
    ),
});

export const playerStatsSchemaWeek = playerStatsSchemaBase.extend({
  week: nullableFloat.describe("The week of the season in which this game happened"),
  team: z
    .string()
    .nullish()
    .describe("The abbreviation of the team this player played for in this game"),
  game_id: z
    .string()
    .nullish()
    .describe(
      "The NFL Verse game identifier of the game this stat line is for (e.g., 2023_01_KC_DET)",
    ),
  opponent_team: z
    .string()
    .nullish()
    .describe("The abbreviation of the team this player faced in this game"),
  gwfg_distance: nullableInt.describe(
    "The distance (in yards) of this player's game winning field goal attempt; null when unavailable",
  ),
});
