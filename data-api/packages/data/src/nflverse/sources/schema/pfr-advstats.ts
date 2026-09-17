import { z } from "zod";
import { nullableInt, nullableFloat, nullableString } from "./helpers";

export const pfrAdvStats_sznIdBase_schema = z.object({
  season: nullableInt.describe("Season year"),
  player: z.string().nullish().describe("Player's full name"),
  pfr_id: nullableString.describe(
    "Pro-Football-Reference player id. Null = not provided by PFR",
  ),
});

export const pfrAdvStats_sznBase_schema = pfrAdvStats_sznIdBase_schema.extend({
  tm: z.string().nullish().describe(
    "Team abbreviation; '(N)TM' means the player played for multiple teams that season (N = number of teams)",
  ),
  age: nullableFloat.describe("Player's age during the season"),
  g: nullableFloat.describe("Games played"),
  gs: nullableFloat.describe("Games started"),
});

export const pfrAdvStats_sznDef_schema = pfrAdvStats_sznBase_schema.extend({
  pos: nullableString.describe(
    "Position(s) listed by PFR, often compound (e.g. 'LCB/RCB'). Null = not listed",
  ),
  int: nullableFloat.describe("Interceptions. Null = not recorded"),
  tgt: nullableFloat.describe(
    "Targets: number of times the receiver this defender covered was targeted",
  ),
  cmp: nullableFloat.describe("Completions allowed (passes completed against this defender)"),
  cmp_percent: nullableFloat.describe(
    "Completion percentage allowed (0-1 fraction). Null = not recorded",
  ),
  yds: nullableFloat.describe("Yards allowed"),
  yds_cmp: nullableFloat.describe("Yards allowed per completion. Null = not recorded"),
  yds_tgt: nullableFloat.describe("Yards allowed per target. Null = not recorded"),
  td: nullableFloat.describe("Touchdowns allowed. Null = not recorded"),
  rat: nullableFloat.describe("Passer rating allowed when targeted. Null = not recorded"),
  dadot: nullableFloat.describe(
    "Depth of target: average depth of target allowed (yards). Null = not recorded",
  ),
  air: nullableFloat.describe(
    "Completed air yards allowed (yards thrown in the air before the catch, excluding yards after catch)",
  ),
  yac: nullableFloat.describe("Yards after catch allowed. Null = not recorded"),
  bltz: nullableFloat.describe("Times blitzed (rushed the passer as a blitzer)"),
  hrry: nullableFloat.describe("Hurries (times the quarterback was hurried)"),
  qbkd: nullableFloat.describe("Quarterback knockdowns"),
  sk: nullableFloat.describe("Sacks"),
  prss: nullableFloat.describe("Pressures (hurries + knockdowns + sacks)"),
  comb: nullableFloat.describe("Combined tackles (solo + assisted)"),
  m_tkl: nullableFloat.describe("Missed tackles"),
  m_tkl_percent: nullableFloat.describe(
    "Missed-tackle percentage (0-1 fraction). Null = not recorded",
  ),
  bats: nullableFloat.describe("Passes batted down (deflections at the line of scrimmage)"),
});

export const pfrAdvStats_sznPass_schema = pfrAdvStats_sznIdBase_schema.extend({
  team: z.string().nullish().describe("Team abbreviation"),
  pass_attempts: nullableFloat.describe("Pass attempts"),
  throwaways: nullableFloat.describe("Throwaways (passes intentionally thrown away to avoid a sack)"),
  spikes: nullableFloat.describe("Spikes (passes spiked into the ground to stop the clock)"),
  drops: nullableFloat.describe("Drops by receivers on this quarterback's passes"),
  drop_pct: nullableFloat.describe("Drop percentage (0-1 fraction). Null = not recorded"),
  bad_throws: nullableFloat.describe("Bad throws (inaccurate passes judged uncatchable)"),
  bad_throw_pct: nullableFloat.describe(
    "Bad-throw percentage (0-1 fraction). Null = not recorded",
  ),
  pocket_time: nullableFloat.describe(
    "Average time in the pocket before throwing (seconds). Null = not recorded",
  ),
  times_blitzed: nullableFloat.describe("Times blitzed"),
  times_hurried: nullableFloat.describe("Times hurried"),
  times_hit: nullableFloat.describe("Times hit while throwing"),
  times_pressured: nullableFloat.describe("Times pressured (hurries + hits + sacks)"),
  pressure_pct: nullableFloat.describe("Pressure percentage (0-1 fraction). Null = not recorded"),
  batted_balls: nullableFloat.describe(
    "Passes batted down at the line of scrimmage. Null = not recorded",
  ),
  on_tgt_throws: nullableFloat.describe(
    "On-target throws (accurate, catchable passes). Null = not recorded",
  ),
  on_tgt_pct: nullableFloat.describe(
    "On-target throw percentage (0-1 fraction). Null = not recorded",
  ),
  rpo_plays: nullableFloat.describe("Run-pass option plays. Null = not recorded"),
  rpo_yards: nullableFloat.describe(
    "Yards gained on run-pass option plays. Null = not recorded",
  ),
  rpo_pass_att: nullableFloat.describe(
    "Pass attempts from run-pass option plays. Null = not recorded",
  ),
  rpo_pass_yards: nullableFloat.describe(
    "Passing yards from run-pass option plays. Null = not recorded",
  ),
  rpo_rush_att: nullableFloat.describe(
    "Rush attempts from run-pass option plays (plays kept by the quarterback). Null = not recorded",
  ),
  rpo_rush_yards: nullableFloat.describe(
    "Rushing yards from run-pass option plays. Null = not recorded",
  ),
  pa_pass_att: nullableFloat.describe("Play-action pass attempts. Null = not recorded"),
  pa_pass_yards: nullableFloat.describe("Play-action passing yards. Null = not recorded"),
  intended_air_yards: nullableFloat.describe(
    "Total intended air yards (air yards on all attempts, completed or not). Null = not recorded",
  ),
  intended_air_yards_per_pass_attempt: nullableFloat.describe(
    "Intended air yards per pass attempt. Null = not recorded",
  ),
  completed_air_yards: nullableFloat.describe(
    "Total completed air yards (air yards on completed passes). Null = not recorded",
  ),
  completed_air_yards_per_completion: nullableFloat.describe(
    "Completed air yards per completion. Null = not recorded",
  ),
  completed_air_yards_per_pass_attempt: nullableFloat.describe(
    "Completed air yards per pass attempt. Null = not recorded",
  ),
  pass_yards_after_catch: nullableFloat.describe(
    "Passing yards after catch (YAC gained by receivers on this quarterback's completions). Null = not recorded",
  ),
  pass_yards_after_catch_per_completion: nullableFloat.describe(
    "Passing yards after catch per completion. Null = not recorded",
  ),
  scrambles: nullableFloat.describe(
    "Scrambles (rushes by the quarterback after dropping back to pass). Null = not recorded",
  ),
  scramble_yards_per_attempt: nullableFloat.describe(
    "Scramble yards per attempt. Null = not recorded",
  ),
});

export const pfrAdvStats_sznRushRecBase_schema = pfrAdvStats_sznBase_schema.extend({
  pos: nullableString.describe(
    "Position(s) listed by PFR, often compound (e.g. 'LCB/RCB' or 'WR/QB'). Null = not listed",
  ),
});

export const pfrAdvStats_sznRush_schema = pfrAdvStats_sznRushRecBase_schema.extend({
  att: nullableFloat.describe("Rush attempts"),
  yds: nullableFloat.describe("Rushing yards"),
  td: nullableFloat.describe("Rushing touchdowns. Null = not recorded"),
  x1d: nullableFloat.describe("Rushing first downs. Null = not recorded"),
  ybc: nullableFloat.describe("Yards before contact. Null = not recorded"),
  ybc_att: nullableFloat.describe("Yards before contact per attempt. Null = not recorded"),
  yac: nullableFloat.describe("Yards after contact. Null = not recorded"),
  yac_att: nullableFloat.describe("Yards after contact per attempt. Null = not recorded"),
  brk_tkl: nullableFloat.describe("Broken tackles. Null = not recorded"),
  att_br: nullableFloat.describe("Rush attempts per broken tackle. Null = not recorded"),
});

export const pfrAdvStats_sznRec_schema = pfrAdvStats_sznRushRecBase_schema.extend({
  tgt: nullableFloat.describe("Targets (times this receiver was targeted)"),
  rec: nullableFloat.describe("Receptions"),
  yds: nullableFloat.describe("Receiving yards"),
  td: nullableFloat.describe("Receiving touchdowns. Null = not recorded"),
  x1d: nullableFloat.describe("Receiving first downs. Null = not recorded"),
  ybc: nullableFloat.describe("Yards before catch (air yards on completed passes). Null = not recorded"),
  ybc_r: nullableFloat.describe("Yards before catch per reception. Null = not recorded"),
  yac: nullableFloat.describe("Yards after catch. Null = not recorded"),
  yac_r: nullableFloat.describe("Yards after catch per reception. Null = not recorded"),
  adot: nullableFloat.describe("Average depth of target (yards). Null = not recorded"),
  brk_tkl: nullableFloat.describe("Broken tackles after the catch. Null = not recorded"),
  rec_br: nullableFloat.describe("Receptions per broken tackle. Null = not recorded"),
  drop: nullableFloat.describe("Drops. Null = not recorded"),
  drop_percent: nullableFloat.describe("Drop percentage (0-1 fraction). Null = not recorded"),
  int: nullableFloat.describe(
    "Interceptions thrown when targeting this receiver. Null = not recorded",
  ),
  rat: nullableFloat.describe("Passer rating when targeted. Null = not recorded"),
});

export const pfrAdvStats_wkBase_schema = z.object({
  game_id: z.string().nullish().describe("nflverse game id"),
  pfr_game_id: z.string().nullish().describe("Pro-Football-Reference game id"),
  season: nullableInt.describe("Season year"),
  week: nullableInt.describe("Week number"),
  game_type: z.enum(["REG", "WC", "DIV", "CON", "SB"])
    .describe(
      "Game type: REG (regular season), WC (wild card), DIV (divisional round), CON (conference championship), SB (Super Bowl)",
    ),
  team: z.string().nullish().describe("Team abbreviation"),
  opponent: z.string().nullish().describe("Opponent team abbreviation"),
  pfr_player_name: z.string().nullish().describe("Player's full name (PFR)"),
  pfr_player_id: z.string().nullish().describe("Pro-Football-Reference player id"),
});

export const pfrAdvStats_wkDef_schema = pfrAdvStats_wkBase_schema.extend({
  def_ints: nullableFloat.describe("Interceptions"),
  def_targets: nullableFloat.describe(
    "Targets (times the receiver this defender covered was targeted)",
  ),
  def_completions_allowed: nullableFloat.describe("Completions allowed"),
  def_completion_pct: nullableFloat.describe(
    "Completion percentage allowed (0-1 fraction). Null = not recorded",
  ),
  def_yards_allowed: nullableFloat.describe("Yards allowed. Null = not recorded"),
  def_yards_allowed_per_cmp: nullableFloat.describe(
    "Yards allowed per completion. Null = not recorded",
  ),
  def_yards_allowed_per_tgt: nullableFloat.describe(
    "Yards allowed per target. Null = not recorded",
  ),
  def_receiving_td_allowed: nullableFloat.describe(
    "Receiving touchdowns allowed. Null = not recorded",
  ),
  def_passer_rating_allowed: nullableFloat.describe(
    "Passer rating allowed when targeted. Null = not recorded",
  ),
  def_adot: nullableFloat.describe(
    "Average depth of target allowed (yards). Null = not recorded",
  ),
  def_air_yards_completed: nullableFloat.describe(
    "Completed air yards allowed. Null = not recorded",
  ),
  def_yards_after_catch: nullableFloat.describe(
    "Yards after catch allowed. Null = not recorded",
  ),
  def_times_blitzed: nullableFloat.describe("Times blitzed. Null = not recorded"),
  def_times_hurried: nullableFloat.describe("Times hurried. Null = not recorded"),
  def_times_hitqb: nullableFloat.describe(
    "Times hit the quarterback. Null = not recorded",
  ),
  def_sacks: nullableFloat.describe("Sacks"),
  def_pressures: nullableFloat.describe("Pressures (hurries + knockdowns + sacks)"),
  def_tackles_combined: nullableFloat.describe("Combined tackles (solo + assisted)"),
  def_missed_tackles: nullableFloat.describe("Missed tackles"),
  def_missed_tackle_pct: nullableFloat.describe(
    "Missed-tackle percentage (0-1 fraction). Null = not recorded",
  ),
});

export const pfrAdvStats_wkPassRecBase_schema = pfrAdvStats_wkBase_schema.extend({
  passing_drops: nullableFloat.describe(
    "Drops by receivers on this quarterback's passes. Null = not recorded",
  ),
  passing_drop_pct: nullableFloat.describe(
    "Passing drop percentage (0-1 fraction). Null = not recorded",
  ),
  receiving_drop: nullableFloat.describe(
    "Drops by this player as a receiver. Null = not recorded",
  ),
  receiving_drop_pct: nullableFloat.describe(
    "Receiving drop percentage (0-1 fraction). Null = not recorded",
  ),
});

export const pfrAdvStats_wkPass_schema = pfrAdvStats_wkPassRecBase_schema.extend({
  passing_bad_throws: nullableFloat.describe("Bad throws (inaccurate passes judged uncatchable)"),
  passing_bad_throw_pct: nullableFloat.describe(
    "Bad-throw percentage (0-1 fraction). Null = not recorded",
  ),
  times_sacked: nullableFloat.describe("Times sacked"),
  times_blitzed: nullableFloat.describe("Times blitzed"),
  times_hurried: nullableFloat.describe("Times hurried"),
  times_hit: nullableFloat.describe("Times hit while throwing"),
  times_pressured: nullableFloat.describe("Times pressured (hurries + hits + sacks)"),
  times_pressured_pct: nullableFloat.describe(
    "Pressure percentage (0-1 fraction). Null = not recorded",
  ),
  def_times_blitzed: nullableFloat.describe(
    "Times blitzed as a defender. Null = not recorded",
  ),
  def_times_hurried: nullableFloat.describe(
    "Times hurried as a defender. Null = not recorded",
  ),
  def_times_hitqb: nullableFloat.describe(
    "Times hit the quarterback as a defender. Null = not recorded",
  ),
});

export const pfrAdvStats_wkRec_schema = pfrAdvStats_wkPassRecBase_schema.extend({
  rushing_broken_tackles: nullableFloat.describe(
    "Broken tackles as a rusher. Null = not recorded",
  ),
  receiving_broken_tackles: nullableFloat.describe(
    "Broken tackles as a receiver. Null = not recorded",
  ),
  receiving_int: nullableFloat.describe("Interceptions thrown when targeting this receiver"),
  receiving_rat: nullableFloat.describe("Passer rating when targeting this receiver"),
});

export const pfrAdvStats_wkRush_schema = pfrAdvStats_wkBase_schema.extend({
  carries: nullableFloat.describe("Rush attempts (carries)"),
  rushing_yards_before_contact: nullableFloat.describe("Rushing yards before contact"),
  rushing_yards_before_contact_avg: nullableFloat.describe(
    "Rushing yards before contact per attempt. Null = not recorded",
  ),
  rushing_yards_after_contact: nullableFloat.describe("Rushing yards after contact"),
  rushing_yards_after_contact_avg: nullableFloat.describe(
    "Rushing yards after contact per attempt. Null = not recorded",
  ),
  rushing_broken_tackles: nullableFloat.describe(
    "Broken tackles as a rusher. Null = not recorded",
  ),
  receiving_broken_tackles: nullableFloat.describe(
    "Broken tackles as a receiver. Null = not recorded",
  ),
});
