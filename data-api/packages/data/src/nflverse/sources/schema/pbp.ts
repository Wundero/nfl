import { z } from "zod";
import { nullableInt, nullableFloat, boolFromBinary, nullableBoolFromBinary, nullableString, coercedNullableString, nullableStringOf, nullableDate } from "./helpers";

export const pbpSchema = z.object({
  play_id: z.coerce.string().describe(
    "Unique play identifier: game_id plus a zero-padded play sequence number.",
  ),
  game_id: z.string().nullish().describe(
    "nflverse game identifier, formatted YYYYMMDDxx where xx is a two-character game code.",
  ),
  old_game_id: z.string().nullish().describe(
    "Deprecated legacy game identifier from earlier nflverse releases, kept for compatibility.",
  ),
  home_team: z.string().nullish().describe("Home team abbreviation (e.g. KC)."),
  away_team: z.string().nullish().describe("Away team abbreviation (e.g. SF)."),
  season_type: z.enum(["REG", "POST"])
    .describe("Season phase: REG = regular season, POST = postseason."),
  week: nullableInt
    .describe(
      "Week of the season (1-18 regular season; 19+ are postseason rounds).",
    ),
  posteam: nullableString.describe(
    "Abbreviation of the team with possession on the play; null when no team has possession.",
  ),
  posteam_type: nullableStringOf(z.enum(["away", "home"])).describe(
    "Whether the possession team (posteam) is the away or home team; null when no posteam.",
  ),
  defteam: nullableString.describe(
    "Abbreviation of the defensive team on the play; null when not applicable.",
  ),
  side_of_field: z.string().nullish().describe(
    "Which team's side of the field the ball is on: team abbreviation, or 50 at midfield.",
  ),
  yardline_100: nullableFloat.describe(
    "Distance in yards from the offense's own end zone (0-100); null for non-offensive plays.",
  ),
  game_date: nullableDate.describe("Kickoff date of the game, ISO 8601 (YYYY-MM-DD)."),
  quarter_seconds_remaining: nullableFloat.describe(
    "Seconds remaining in the quarter at the start of the play (900 at quarter start); null in overtime.",
  ),
  half_seconds_remaining: nullableFloat.describe(
    "Seconds remaining in the half at the start of the play (1800 at half start); null in overtime.",
  ),
  game_seconds_remaining: nullableFloat.describe(
    "Seconds remaining in the game at the start of the play (3600 at game start).",
  ),
  game_half: z.enum(["Half1", "Half2", "Overtime"])
    .describe("Game period: Half1 = first half, Half2 = second half, Overtime."),
  quarter_end: boolFromBinary.describe(
    "1 if the play ended a quarter, 0 otherwise.",
  ),
  drive: nullableFloat.describe(
    "Drive number of the game for the possession team (1-indexed); null when not applicable.",
  ),
  sp: boolFromBinary.describe(
    "1 if the play was a scoring play (touchdown, field goal, safety, etc.), 0 otherwise.",
  ),
  qtr: nullableFloat
    .describe("Quarter of the game (1-4; 5 = overtime)."),
  down: nullableFloat.describe(
    "Down of the play (1-4); null for kickoffs and other non-scrimmage plays.",
  ),
  goal_to_go: nullableFloat.describe(
    "1 if the offense is within 10 yards of the end zone (goal-to-go), 0 otherwise; null for non-offensive plays.",
  ),
  time: nullableString.describe(
    "Game clock at the start of the play as string MM:SS (max 15:00).",
  ),
  yrdln: nullableString.describe(
    "Yard line at the start of the play, formatted 'TEAM YARDLINE' (e.g. 'ARI 40') or '50' at midfield.",
  ),
  ydstogo: nullableFloat.describe(
    "Yards to go for a first down (or touchdown in goal-to-go situations).",
  ),
  ydsnet: nullableFloat.describe(
    "Net yards gained or lost by the offense on the play (negative for losses); null on kickoffs.",
  ),
  desc: z.string().nullish().describe(
    "Detailed natural-language description of the play.",
  ),
  play_type: nullableStringOf(
    z.enum([
      "kickoff",
      "run",
      "pass",
      "extra_point",
      "field_goal",
      "no_play",
      "qb_kneel",
      "punt",
      "qb_spike",
    ]),
  ).describe(
    "Play type: kickoff, run, pass, extra_point, field_goal, no_play, qb_kneel, punt, or qb_spike; null when unknown.",
  ),
  yards_gained: nullableFloat.describe(
    "Yards gained by the offense on the play (negative for losses); null on kickoffs and punts.",
  ),
  shotgun: boolFromBinary.describe(
    "1 if the offense lined up in shotgun formation, 0 otherwise.",
  ),
  no_huddle: boolFromBinary.describe(
    "1 if the offense ran the play without a huddle, 0 otherwise.",
  ),
  qb_dropback: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the QB dropped back to pass (includes sacks, scrambles, and pass attempts), 0 if no dropback, null when unknown.",
  ),
  qb_kneel: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the QB took a knee, 0 otherwise, null when unknown.",
  ),
  qb_spike: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the QB spiked the ball, 0 otherwise, null when unknown.",
  ),
  qb_scramble: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the QB scrambled on a dropback, 0 otherwise, null when unknown.",
  ),
  pass_length: nullableStringOf(z.enum(["short", "deep"])).describe(
    "Pass target depth classification: short or deep (based on air yards); null on non-pass plays.",
  ),
  pass_location: nullableStringOf(z.enum(["left", "middle", "right"])).describe(
    "Direction of the pass attempt: left, middle, or right; null on non-pass plays.",
  ),
  air_yards: nullableFloat.describe(
    "Air yards of the pass: distance from the line of scrimmage to the intended receiver (negative when behind the line); null on non-pass plays.",
  ),
  yards_after_catch: nullableFloat.describe(
    "Yards gained after the catch by the receiver; null on non-pass or incomplete plays.",
  ),
  run_location: nullableStringOf(z.enum(["middle", "left", "right"])).describe(
    "Direction of the run: middle, left, or right; null on non-run plays.",
  ),
  run_gap: nullableStringOf(z.enum(["guard", "end", "tackle"])).describe(
    "Offensive line gap the run was aimed at: guard, tackle, or end; null on non-run plays.",
  ),
  field_goal_result: nullableStringOf(z.enum(["made", "missed", "blocked"])).describe(
    "Field goal outcome: made, missed, or blocked; null on non-field-goal plays.",
  ),
  kick_distance: nullableFloat.describe(
    "Distance of the kick in yards (kickoff, punt, or field goal); null on non-kick plays.",
  ),
  extra_point_result: nullableStringOf(
    z.enum(["good", "failed", "blocked", "aborted"]),
  ).describe(
    "Extra point outcome: good, failed, blocked, or aborted; null on non-extra-point plays.",
  ),
  two_point_conv_result: nullableStringOf(z.enum(["success", "failure"])).describe(
    "Two-point conversion outcome: success or failure; null on non-two-point-attempt plays.",
  ),
  home_timeouts_remaining: nullableFloat.describe(
    "Timeouts remaining for the home team at the start of the play.",
  ),
  away_timeouts_remaining: nullableFloat.describe(
    "Timeouts remaining for the away team at the start of the play.",
  ),
  timeout: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a timeout was charged on this play, 0 otherwise, null when unknown.",
  ),
  timeout_team: nullableString.describe(
    "Abbreviation of the team charged with the timeout; null if no timeout on the play.",
  ),
  td_team: nullableString.describe(
    "Abbreviation of the team that scored a touchdown on the play; null if no touchdown.",
  ),
  td_player_name: nullableString.describe(
    "Short name (e.g. A.Rodgers) of the player who scored the touchdown; null if no touchdown.",
  ),
  td_player_id: nullableString.describe(
    "GSIS player ID (00- format) of the touchdown scorer; null if no touchdown.",
  ),
  posteam_timeouts_remaining: nullableFloat.describe(
    "Timeouts remaining for the possession team at the start of the play; null when no posteam.",
  ),
  defteam_timeouts_remaining: nullableFloat.describe(
    "Timeouts remaining for the defensive team at the start of the play; null when no defteam.",
  ),
  total_home_score: nullableFloat.describe(
    "Home team's total score after the play.",
  ),
  total_away_score: nullableFloat.describe(
    "Away team's total score after the play.",
  ),
  posteam_score: nullableFloat.describe(
    "Possession team's score after the play; null when no posteam.",
  ),
  defteam_score: nullableFloat.describe(
    "Defensive team's score after the play; null when no defteam.",
  ),
  score_differential: nullableFloat.describe(
    "Score differential (possession team minus defensive team) after the play; null when not applicable.",
  ),
  posteam_score_post: nullableFloat.describe(
    "Possession team's score after the play, recomputed from fixed drive data; null when no posteam.",
  ),
  defteam_score_post: nullableFloat.describe(
    "Defensive team's score after the play, recomputed from fixed drive data; null when no defteam.",
  ),
  score_differential_post: nullableFloat.describe(
    "Score differential after the play, recomputed from fixed drive data; null when not applicable.",
  ),
  no_score_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) that the current drive ends without a score.",
  ),
  opp_fg_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) that the opposing team scores a field goal on the drive.",
  ),
  opp_safety_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) that the opposing team scores a safety on the drive.",
  ),
  opp_td_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) that the opposing team scores a touchdown on the drive.",
  ),
  fg_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) that the possession team scores a field goal on the drive.",
  ),
  safety_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) that the possession team scores a safety on the drive.",
  ),
  td_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) that the possession team scores a touchdown on the drive.",
  ),
  extra_point_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) of a successful extra point attempt.",
  ),
  two_point_conversion_prob: nullableFloat.describe(
    "nflfastR model output: probability (0-1) of a successful two-point conversion attempt.",
  ),
  ep: nullableFloat.describe(
    "Expected points (nflfastR model) before the play.",
  ),
  epa: nullableFloat.describe(
    "Expected points added by the play (nflfastR model, in points); null on kickoffs and other plays without EPA.",
  ),
  total_home_epa: nullableFloat.describe(
    "Cumulative EPA (in points) for the home team in the game up to and including this play.",
  ),
  total_away_epa: nullableFloat.describe(
    "Cumulative EPA (in points) for the away team in the game up to and including this play.",
  ),
  total_home_rush_epa: nullableFloat.describe(
    "Cumulative rushing EPA (in points) for the home team in the game.",
  ),
  total_away_rush_epa: nullableFloat.describe(
    "Cumulative rushing EPA (in points) for the away team in the game.",
  ),
  total_home_pass_epa: nullableFloat.describe(
    "Cumulative passing EPA (in points) for the home team in the game.",
  ),
  total_away_pass_epa: nullableFloat.describe(
    "Cumulative passing EPA (in points) for the away team in the game.",
  ),
  air_epa: nullableFloat.describe(
    "EPA (in points) attributed to the air yards of the pass (nflfastR decomposition); null on non-pass plays.",
  ),
  yac_epa: nullableFloat.describe(
    "EPA (in points) attributed to yards after catch (nflfastR decomposition); null on non-pass plays.",
  ),
  comp_air_epa: nullableFloat.describe(
    "Air EPA (in points) on completed passes only; null on incompletions and non-pass plays.",
  ),
  comp_yac_epa: nullableFloat.describe(
    "YAC EPA (in points) on completed passes only; null on incompletions and non-pass plays.",
  ),
  total_home_comp_air_epa: nullableFloat.describe(
    "Cumulative air EPA (in points) on completed passes for the home team.",
  ),
  total_away_comp_air_epa: nullableFloat.describe(
    "Cumulative air EPA (in points) on completed passes for the away team.",
  ),
  total_home_comp_yac_epa: nullableFloat.describe(
    "Cumulative YAC EPA (in points) on completed passes for the home team.",
  ),
  total_away_comp_yac_epa: nullableFloat.describe(
    "Cumulative YAC EPA (in points) on completed passes for the away team.",
  ),
  total_home_raw_air_epa: nullableFloat.describe(
    "Cumulative raw (uncapped) air EPA (in points) for the home team.",
  ),
  total_away_raw_air_epa: nullableFloat.describe(
    "Cumulative raw (uncapped) air EPA (in points) for the away team.",
  ),
  total_home_raw_yac_epa: nullableFloat.describe(
    "Cumulative raw (uncapped) YAC EPA (in points) for the home team.",
  ),
  total_away_raw_yac_epa: nullableFloat.describe(
    "Cumulative raw (uncapped) YAC EPA (in points) for the away team.",
  ),
  wp: nullableFloat.describe(
    "Win probability (0-1) for the possession team before the play (nflfastR model); null when no posteam.",
  ),
  def_wp: nullableFloat.describe(
    "Win probability (0-1) for the defensive team before the play (nflfastR model); null when no defteam.",
  ),
  home_wp: nullableFloat.describe(
    "Win probability (0-1) for the home team before the play (nflfastR model).",
  ),
  away_wp: nullableFloat.describe(
    "Win probability (0-1) for the away team before the play (nflfastR model).",
  ),
  wpa: nullableFloat.describe(
    "Win probability added by the play (post-play minus pre-play WP from the possession team's perspective); null when not applicable.",
  ),
  vegas_wpa: nullableFloat.describe(
    "Win probability added by the play using Vegas-implied win probability; null when not applicable.",
  ),
  vegas_home_wpa: nullableFloat.describe(
    "Vegas-based win probability added by the play from the home team's perspective; null when not applicable.",
  ),
  home_wp_post: nullableFloat.describe(
    "Home team's win probability (0-1) after the play, recomputed from fixed drive data; null when unavailable.",
  ),
  away_wp_post: nullableFloat.describe(
    "Away team's win probability (0-1) after the play, recomputed from fixed drive data; null when unavailable.",
  ),
  vegas_wp: nullableFloat.describe(
    "Win probability (0-1) for the possession team implied by the pre-game Vegas line; null when no posteam.",
  ),
  vegas_home_wp: nullableFloat.describe(
    "Win probability (0-1) for the home team implied by the pre-game Vegas line.",
  ),
  total_home_rush_wpa: nullableFloat.describe(
    "Cumulative rushing WPA for the home team in the game.",
  ),
  total_away_rush_wpa: nullableFloat.describe(
    "Cumulative rushing WPA for the away team in the game.",
  ),
  total_home_pass_wpa: nullableFloat.describe(
    "Cumulative passing WPA for the home team in the game.",
  ),
  total_away_pass_wpa: nullableFloat.describe(
    "Cumulative passing WPA for the away team in the game.",
  ),
  air_wpa: nullableFloat.describe(
    "WPA attributed to the air yards of the pass (nflfastR decomposition); null on non-pass plays.",
  ),
  yac_wpa: nullableFloat.describe(
    "WPA attributed to yards after catch (nflfastR decomposition); null on non-pass plays.",
  ),
  comp_air_wpa: nullableFloat.describe(
    "Air WPA on completed passes only; null on incompletions and non-pass plays.",
  ),
  comp_yac_wpa: nullableFloat.describe(
    "YAC WPA on completed passes only; null on incompletions and non-pass plays.",
  ),
  total_home_comp_air_wpa: nullableFloat.describe(
    "Cumulative air WPA on completed passes for the home team.",
  ),
  total_away_comp_air_wpa: nullableFloat.describe(
    "Cumulative air WPA on completed passes for the away team.",
  ),
  total_home_comp_yac_wpa: nullableFloat.describe(
    "Cumulative YAC WPA on completed passes for the home team.",
  ),
  total_away_comp_yac_wpa: nullableFloat.describe(
    "Cumulative YAC WPA on completed passes for the away team.",
  ),
  total_home_raw_air_wpa: nullableFloat.describe(
    "Cumulative raw (uncapped) air WPA for the home team.",
  ),
  total_away_raw_air_wpa: nullableFloat.describe(
    "Cumulative raw (uncapped) air WPA for the away team.",
  ),
  total_home_raw_yac_wpa: nullableFloat.describe(
    "Cumulative raw (uncapped) YAC WPA for the home team.",
  ),
  total_away_raw_yac_wpa: nullableFloat.describe(
    "Cumulative raw (uncapped) YAC WPA for the away team.",
  ),
  punt_blocked: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the punt was blocked, 0 otherwise, null when not applicable.",
  ),
  first_down_rush: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play earned a first down by rushing, 0 otherwise, null when not applicable.",
  ),
  first_down_pass: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play earned a first down by passing, 0 otherwise, null when not applicable.",
  ),
  first_down_penalty: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play earned a first down by penalty, 0 otherwise, null when not applicable.",
  ),
  third_down_converted: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a third down was converted, 0 otherwise, null when not applicable.",
  ),
  third_down_failed: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a third down attempt failed, 0 otherwise, null when not applicable.",
  ),
  fourth_down_converted: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a fourth down was converted, 0 otherwise, null when not applicable.",
  ),
  fourth_down_failed: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a fourth down attempt failed, 0 otherwise, null when not applicable.",
  ),
  incomplete_pass: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the pass was incomplete, 0 otherwise, null when not applicable.",
  ),
  touchback: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play resulted in a touchback, 0 otherwise, null when not applicable.",
  ),
  interception: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the pass was intercepted, 0 otherwise, null when not applicable.",
  ),
  punt_inside_twenty: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the punt landed inside the 20-yard line, 0 otherwise, null when not applicable.",
  ),
  punt_in_endzone: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the punt landed in the end zone, 0 otherwise, null when not applicable.",
  ),
  punt_out_of_bounds: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the punt went out of bounds, 0 otherwise, null when not applicable.",
  ),
  punt_downed: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the punt was downed by the kicking team, 0 otherwise, null when not applicable.",
  ),
  punt_fair_catch: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the punt was fair-caught, 0 otherwise, null when not applicable.",
  ),
  kickoff_inside_twenty: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the kickoff landed inside the 20-yard line, 0 otherwise, null when not applicable.",
  ),
  kickoff_in_endzone: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the kickoff landed in the end zone, 0 otherwise, null when not applicable.",
  ),
  kickoff_out_of_bounds: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the kickoff went out of bounds, 0 otherwise, null when not applicable.",
  ),
  kickoff_downed: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the kickoff was downed by the kicking team, 0 otherwise, null when not applicable.",
  ),
  kickoff_fair_catch: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the kickoff was fair-caught, 0 otherwise, null when not applicable.",
  ),
  fumble_forced: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a fumble was forced on the play, 0 otherwise, null when not applicable.",
  ),
  fumble_not_forced: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a fumble occurred without being forced, 0 otherwise, null when not applicable.",
  ),
  fumble_out_of_bounds: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a fumble went out of bounds, 0 otherwise, null when not applicable.",
  ),
  solo_tackle: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a solo tackle was recorded (see solo_tackle_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  safety: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play resulted in a safety, 0 otherwise, null when not applicable.",
  ),
  penalty: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a penalty was called on the play, 0 otherwise, null when not applicable.",
  ),
  tackled_for_loss: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the ball carrier was tackled for a loss (see tackle_for_loss_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  fumble_lost: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the fumble was lost to the opposing team, 0 otherwise, null when not applicable.",
  ),
  own_kickoff_recovery: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the kicking team recovered its own kickoff, 0 otherwise, null when not applicable.",
  ),
  own_kickoff_recovery_td: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the kicking team recovered its own kickoff and returned it for a touchdown, 0 otherwise, null when not applicable.",
  ),
  qb_hit: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the QB was hit on a dropback (see qb_hit_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  rush_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a rushing attempt occurred, 0 otherwise, null when not applicable.",
  ),
  pass_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a passing attempt occurred, 0 otherwise, null when not applicable.",
  ),
  sack: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the QB was sacked, 0 otherwise, null when not applicable.",
  ),
  touchdown: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a touchdown was scored on the play, 0 otherwise, null when not applicable.",
  ),
  pass_touchdown: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a passing touchdown was scored, 0 otherwise, null when not applicable.",
  ),
  rush_touchdown: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a rushing touchdown was scored, 0 otherwise, null when not applicable.",
  ),
  return_touchdown: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a return touchdown was scored (punt, kickoff, interception, or fumble return), 0 otherwise, null when not applicable.",
  ),
  extra_point_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if an extra point attempt occurred, 0 otherwise, null when not applicable.",
  ),
  two_point_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a two-point conversion attempt occurred, 0 otherwise, null when not applicable.",
  ),
  field_goal_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a field goal attempt occurred, 0 otherwise, null when not applicable.",
  ),
  kickoff_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a kickoff occurred, 0 otherwise, null when not applicable.",
  ),
  punt_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a punt occurred, 0 otherwise, null when not applicable.",
  ),
  fumble: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a fumble occurred on the play, 0 otherwise, null when not applicable.",
  ),
  complete_pass: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the pass was completed, 0 otherwise, null when not applicable.",
  ),
  assist_tackle: nullableBoolFromBinary.describe(
    "Tri-state: 1 if an assisted tackle was recorded (see assist_tackle_1-4 columns), 0 otherwise, null when not applicable.",
  ),
  lateral_reception: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a lateral reception occurred, 0 otherwise, null when not applicable.",
  ),
  lateral_rush: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a lateral rush occurred, 0 otherwise, null when not applicable.",
  ),
  lateral_return: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a lateral return occurred, 0 otherwise, null when not applicable.",
  ),
  lateral_recovery: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a lateral fumble recovery occurred, 0 otherwise, null when not applicable.",
  ),
  passer_player_id: nullableString.describe(
    "GSIS player ID of the passer; null on non-pass plays.",
  ),
  passer_player_name: nullableString.describe(
    "Full name of the passer; null on non-pass plays.",
  ),
  passing_yards: nullableFloat.describe(
    "Yards gained on the pass attempt; null on non-pass plays.",
  ),
  receiver_player_id: nullableString.describe(
    "GSIS player ID of the receiver who caught the pass; null on incomplete or non-pass plays.",
  ),
  receiver_player_name: nullableString.describe(
    "Full name of the receiver who caught the pass; null on incomplete or non-pass plays.",
  ),
  receiving_yards: nullableFloat.describe(
    "Yards gained on the reception; null on incomplete or non-pass plays.",
  ),
  rusher_player_id: nullableString.describe(
    "GSIS player ID of the rusher who carried the ball; null on non-run plays.",
  ),
  rusher_player_name: nullableString.describe(
    "Full name of the rusher who carried the ball; null on non-run plays.",
  ),
  rushing_yards: nullableFloat.describe(
    "Yards gained on the rush; null on non-run plays.",
  ),
  lateral_receiver_player_id: nullableString.describe(
    "GSIS player ID of the player who caught the lateral pass; null when not applicable.",
  ),
  lateral_receiver_player_name: nullableString.describe(
    "Full name of the player who caught the lateral pass; null when not applicable.",
  ),
  lateral_receiving_yards: nullableFloat.describe(
    "Yards gained on the lateral reception; null when not applicable.",
  ),
  lateral_rusher_player_id: nullableString.describe(
    "GSIS player ID of the player who carried the ball on the lateral rush; null when not applicable.",
  ),
  lateral_rusher_player_name: nullableString.describe(
    "Full name of the player who carried the ball on the lateral rush; null when not applicable.",
  ),
  lateral_rushing_yards: nullableFloat.describe(
    "Yards gained on the lateral rush; null when not applicable.",
  ),
  lateral_sack_player_id: nullableString.describe(
    "GSIS player ID of the QB sacked on the lateral pass attempt; null when not applicable.",
  ),
  lateral_sack_player_name: nullableString.describe(
    "Full name of the QB sacked on the lateral pass attempt; null when not applicable.",
  ),
  interception_player_id: nullableString.describe(
    "GSIS player ID of the defensive player who intercepted the pass; null when not applicable.",
  ),
  interception_player_name: nullableString.describe(
    "Full name of the defensive player who intercepted the pass; null when not applicable.",
  ),
  lateral_interception_player_id: nullableString.describe(
    "GSIS player ID of the defensive player who intercepted the lateral pass; null when not applicable.",
  ),
  lateral_interception_player_name: nullableString.describe(
    "Full name of the defensive player who intercepted the lateral pass; null when not applicable.",
  ),
  punt_returner_player_id: nullableString.describe(
    "GSIS player ID of the punt returner; null when not applicable.",
  ),
  punt_returner_player_name: nullableString.describe(
    "Full name of the punt returner; null when not applicable.",
  ),
  lateral_punt_returner_player_id: nullableString.describe(
    "GSIS player ID of the player who returned the lateral after the punt return; null when not applicable.",
  ),
  lateral_punt_returner_player_name: nullableString.describe(
    "Full name of the player who returned the lateral after the punt return; null when not applicable.",
  ),
  kickoff_returner_player_name: nullableString.describe(
    "Full name of the kickoff returner; null when not applicable.",
  ),
  kickoff_returner_player_id: nullableString.describe(
    "GSIS player ID of the kickoff returner; null when not applicable.",
  ),
  lateral_kickoff_returner_player_id: nullableString.describe(
    "GSIS player ID of the player who returned the lateral after the kickoff return; null when not applicable.",
  ),
  lateral_kickoff_returner_player_name: nullableString.describe(
    "Full name of the player who returned the lateral after the kickoff return; null when not applicable.",
  ),
  punter_player_id: nullableString.describe(
    "GSIS player ID of the punter; null when not applicable.",
  ),
  punter_player_name: nullableString.describe(
    "Full name of the punter; null when not applicable.",
  ),
  kicker_player_id: nullableString.describe(
    "GSIS player ID of the kicker (kickoff or field goal); null when not applicable.",
  ),
  kicker_player_name: nullableString.describe(
    "Full name of the kicker (kickoff or field goal); null when not applicable.",
  ),
  own_kickoff_recovery_player_id: nullableString.describe(
    "GSIS player ID of the player who recovered their own team's kickoff; null when not applicable.",
  ),
  own_kickoff_recovery_player_name: nullableString.describe(
    "Full name of the player who recovered their own team's kickoff; null when not applicable.",
  ),
  blocked_player_id: nullableString.describe(
    "GSIS player ID of the player who blocked the kick; null when not applicable.",
  ),
  blocked_player_name: nullableString.describe(
    "Full name of the player who blocked the kick; null when not applicable.",
  ),
  tackle_for_loss_1_player_id: nullableString.describe(
    "GSIS player ID of the first player credited with a tackle for loss; null when not applicable.",
  ),
  tackle_for_loss_1_player_name: nullableString.describe(
    "Full name of the first player credited with a tackle for loss; null when not applicable.",
  ),
  tackle_for_loss_2_player_id: nullableString.describe(
    "GSIS player ID of the second player credited with a tackle for loss; null when not applicable.",
  ),
  tackle_for_loss_2_player_name: nullableString.describe(
    "Full name of the second player credited with a tackle for loss; null when not applicable.",
  ),
  qb_hit_1_player_id: nullableString.describe(
    "GSIS player ID of the first player credited with a QB hit; null when not applicable.",
  ),
  qb_hit_1_player_name: nullableString.describe(
    "Full name of the first player credited with a QB hit; null when not applicable.",
  ),
  qb_hit_2_player_id: nullableString.describe(
    "GSIS player ID of the second player credited with a QB hit; null when not applicable.",
  ),
  qb_hit_2_player_name: nullableString.describe(
    "Full name of the second player credited with a QB hit; null when not applicable.",
  ),
  forced_fumble_player_1_team: nullableString.describe(
    "Team abbreviation of the first player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_1_player_id: nullableString.describe(
    "GSIS player ID of the first player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_1_player_name: nullableString.describe(
    "Full name of the first player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_2_team: nullableString.describe(
    "Team abbreviation of the second player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_2_player_id: nullableString.describe(
    "GSIS player ID of the second player who forced the fumble; null when not applicable.",
  ),
  forced_fumble_player_2_player_name: nullableString.describe(
    "Full name of the second player who forced the fumble; null when not applicable.",
  ),
  solo_tackle_1_team: nullableString.describe(
    "Team abbreviation of the player credited with the first solo tackle; null when not applicable.",
  ),
  solo_tackle_1_player_id: nullableString.describe(
    "GSIS player ID of the player credited with the first solo tackle; null when not applicable.",
  ),
  solo_tackle_1_player_name: nullableString.describe(
    "Full name of the player credited with the first solo tackle; null when not applicable.",
  ),
  solo_tackle_2_team: nullableString.describe(
    "Team abbreviation of the player credited with the second solo tackle; null when not applicable.",
  ),
  solo_tackle_2_player_id: nullableString.describe(
    "GSIS player ID of the player credited with the second solo tackle; null when not applicable.",
  ),
  solo_tackle_2_player_name: nullableString.describe(
    "Full name of the player credited with the second solo tackle; null when not applicable.",
  ),
  assist_tackle_1_team: nullableString.describe(
    "Team abbreviation of the first player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_1_player_id: nullableString.describe(
    "GSIS player ID of the first player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_1_player_name: nullableString.describe(
    "Full name of the first player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_2_team: nullableString.describe(
    "Team abbreviation of the second player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_2_player_id: nullableString.describe(
    "GSIS player ID of the second player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_2_player_name: nullableString.describe(
    "Full name of the second player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_3_team: nullableString.describe(
    "Team abbreviation of the third player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_3_player_id: nullableString.describe(
    "GSIS player ID of the third player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_3_player_name: nullableString.describe(
    "Full name of the third player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_4_team: nullableString.describe(
    "Team abbreviation of the fourth player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_4_player_id: nullableString.describe(
    "GSIS player ID of the fourth player credited with an assisted tackle; null when not applicable.",
  ),
  assist_tackle_4_player_name: nullableString.describe(
    "Full name of the fourth player credited with an assisted tackle; null when not applicable.",
  ),
  tackle_with_assist: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a tackle was made with an assist (see tackle_with_assist_1/2 columns), 0 otherwise, null when not applicable.",
  ),
  tackle_with_assist_1_player_id: nullableString.describe(
    "GSIS player ID of the primary tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_1_player_name: nullableString.describe(
    "Full name of the primary tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_1_team: nullableString.describe(
    "Team abbreviation of the primary tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_2_player_id: nullableString.describe(
    "GSIS player ID of the assisting tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_2_player_name: nullableString.describe(
    "Full name of the assisting tackler on a tackle with assist; null when not applicable.",
  ),
  tackle_with_assist_2_team: nullableString.describe(
    "Team abbreviation of the assisting tackler on a tackle with assist; null when not applicable.",
  ),
  pass_defense_1_player_id: nullableString.describe(
    "GSIS player ID of the first player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  pass_defense_1_player_name: nullableString.describe(
    "Full name of the first player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  pass_defense_2_player_id: nullableString.describe(
    "GSIS player ID of the second player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  pass_defense_2_player_name: nullableString.describe(
    "Full name of the second player credited with a pass defense (pass breakup); null when not applicable.",
  ),
  fumbled_1_team: nullableString.describe(
    "Team abbreviation of the first player who fumbled; null when not applicable.",
  ),
  fumbled_1_player_id: nullableString.describe(
    "GSIS player ID of the first player who fumbled; null when not applicable.",
  ),
  fumbled_1_player_name: nullableString.describe(
    "Full name of the first player who fumbled; null when not applicable.",
  ),
  fumbled_2_player_id: nullableString.describe(
    "GSIS player ID of the second player who fumbled; null when not applicable.",
  ),
  fumbled_2_player_name: nullableString.describe(
    "Full name of the second player who fumbled; null when not applicable.",
  ),
  fumbled_2_team: nullableString.describe(
    "Team abbreviation of the second player who fumbled; null when not applicable.",
  ),
  fumble_recovery_1_team: nullableString.describe(
    "Team abbreviation of the first player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_1_player_id: nullableString.describe(
    "GSIS player ID of the first player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_1_player_name: nullableString.describe(
    "Full name of the first player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_2_team: nullableString.describe(
    "Team abbreviation of the second player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_2_player_id: nullableString.describe(
    "GSIS player ID of the second player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_2_player_name: nullableString.describe(
    "Full name of the second player who recovered the fumble; null when not applicable.",
  ),
  fumble_recovery_1_yards: nullableFloat.describe(
    "Yards gained on the first fumble recovery return; null when not applicable.",
  ),
  fumble_recovery_2_yards: nullableFloat.describe(
    "Yards gained on the second fumble recovery return; null when not applicable.",
  ),
  sack_player_id: nullableString.describe(
    "GSIS player ID of the player credited with a full sack; null when not applicable.",
  ),
  sack_player_name: nullableString.describe(
    "Full name of the player credited with a full sack; null when not applicable.",
  ),
  half_sack_1_player_id: nullableString.describe(
    "GSIS player ID of the first player credited with a half sack; null when not applicable.",
  ),
  half_sack_1_player_name: nullableString.describe(
    "Full name of the first player credited with a half sack; null when not applicable.",
  ),
  half_sack_2_player_id: nullableString.describe(
    "GSIS player ID of the second player credited with a half sack; null when not applicable.",
  ),
  half_sack_2_player_name: nullableString.describe(
    "Full name of the second player credited with a half sack; null when not applicable.",
  ),
  return_team: nullableString.describe(
    "Team abbreviation of the team returning the kick or punt; null when not applicable.",
  ),
  return_yards: nullableFloat.describe(
    "Yards gained on the return; null when not applicable.",
  ),
  penalty_team: nullableString.describe(
    "Team abbreviation of the team penalized on the play; null if no penalty.",
  ),
  penalty_player_id: nullableString.describe(
    "GSIS player ID of the penalized player; null if no penalty or if the penalty was on the team/bench.",
  ),
  penalty_player_name: nullableString.describe(
    "Full name of the penalized player; null if no penalty or if the penalty was on the team/bench.",
  ),
  penalty_yards: nullableFloat.describe(
    "Yards assessed for the penalty; null if no penalty.",
  ),
  replay_or_challenge: nullableBoolFromBinary.describe(
    "Tri-state: 1 if a replay review or coach's challenge occurred on the play, 0 otherwise, null when not applicable.",
  ),
  replay_or_challenge_result: nullableStringOf(
    z.enum(["reversed", "upheld", "denied"]),
  ).describe(
    "Result of the replay review or challenge: reversed, upheld, or denied; null if no review occurred.",
  ),
  penalty_type: z.pipe(
    nullableString,
    z.union([
      z.null(),
      z.enum([
        "Unnecessary Roughness",
        "Defensive Pass Interference",
        "Face Mask",
        "False Start",
        "Defensive Holding",
        "Roughing the Passer",
        "Kickoff Short of Landing Zone",
        "Offensive Holding",
        "Defensive Too Many Men on Field",
        "Kickoff Out of Bounds",
        "Illegal Formation",
        "Horse Collar Tackle",
        "Offensive Pass Interference",
        "Delay of Game",
        "Defensive Offside",
        "Kick Catch Interference",
        "Ineligible Downfield Pass",
        "Illegal Contact",
        "Illegal Shift",
        "Illegal Block Above the Waist",
        "Player Out of Bounds on Kick",
        "Neutral Zone Infraction",
        "Encroachment",
        "Illegal Use of Hands",
        "Offensive Too Many Men on Field",
        "Illegal Substitution",
        "Illegal Touch Pass",
        "Unsportsmanlike Conduct",
        "Intentional Grounding",
        "Fair Catch Interference",
        "Taunting",
        "Illegal Forward Pass",
        "Defensive Delay of Game",
        "Roughing the Kicker",
        "Illegal Motion",
        "Illegal Kick/Kicking Loose Ball",
        "Leverage",
        "Ineligible Downfield Kick",
        "Chop Block",
        "Illegal Blindside Block",
        "Illegal Touch Kick",
        "Clipping",
        "Low Block",
        "Offensive Offside",
        "Lowering the Head to Make Forcible Contact",
        "Tripping",
        "Disqualification",
        "Running Into the Kicker",
        "Illegal Bat",
        "Illegal Crackback",
        "Hip Drop Tackle",
        "Offensive 12 On-field",
        "Personal Foul",
        "Player Out of Bounds on Punt",
        "Defensive 12 On-field",
        "Offside on Free Kick",
        "Illegal Wedge",
        "Illegal Kick",
        "Interference with Opportunity to Catch",
        "Illegal Peelback",
        "Leaping",
        "Invalid Fair Catch Signal",
        "Face Mask (5 Yards)",
        "Illegal Procedure",
        "Illegal Receiver Pass",
        "Illegal Cut",
        "Short Free Kick",
        "Illegally Kicking Ball",
        "Delay of Kickoff",
        "Illegal Scrimmage Kick",
        "Lowering the Head to Initiate Contact",
        "Illegal Double-Team Block",
        "Horse Collar",
      ]),
      z.string(),
    ]),
  ).describe(
    "Type of penalty called on the play, e.g. 'Offensive Holding', 'False Start', 'Defensive Pass Interference', 'Roughing the Passer', 'Unnecessary Roughness' (free-form string beyond the enumerated values); null if no penalty.",
  ),
  defensive_two_point_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the defense attempted a defensive two-point conversion (e.g. returning an interception or fumble on a conversion attempt), 0 otherwise, null when not applicable.",
  ),
  defensive_two_point_conv: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the defense converted a defensive two-point conversion, 0 otherwise, null when not applicable.",
  ),
  defensive_extra_point_attempt: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the defense attempted a defensive extra point (e.g. returning a blocked extra point), 0 otherwise, null when not applicable.",
  ),
  defensive_extra_point_conv: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the defense converted a defensive extra point, 0 otherwise, null when not applicable.",
  ),
  safety_player_name: nullableString.describe(
    "Full name of the player tackled or sacked in the end zone for the safety; null if no safety.",
  ),
  safety_player_id: nullableString.describe(
    "GSIS player ID of the player tackled or sacked in the end zone for the safety; null if no safety.",
  ),
  season: nullableInt
    .describe("Season year (e.g. 2024)."),
  cp: nullableFloat.describe(
    "Completion probability (0-1) of the pass attempt (nflfastR model); null on non-pass plays.",
  ),
  cpoe: nullableFloat.describe(
    "Completion percentage over expected for the pass attempt (nflfastR model); null on non-pass plays.",
  ),
  series: nullableFloat
    .describe("Series number within the game (nflfastR drive subdivision)."),
  series_success: boolFromBinary.describe(
    "1 if the series was successful (first down or touchdown), 0 otherwise.",
  ),
  series_result: nullableStringOf(
    z.enum([
      "First down",
      "Touchdown",
      "Turnover",
      "Field goal",
      "QB kneel",
      "Punt",
      "Turnover on downs",
      "Missed field goal",
      "End of half",
      "Opp touchdown",
      "Safety",
    ]),
  ).describe(
    "Result of the series: First down, Touchdown, Turnover, Field goal, QB kneel, Punt, Turnover on downs, Missed field goal, End of half, Opp touchdown, or Safety.",
  ),
  order_sequence: nullableFloat.describe(
    "Order sequence number of the play, used for ordering plays within a game; null when unavailable.",
  ),
  start_time: nullableDate.describe(
    "Kickoff timestamp of the play, parsed from a non-ISO format (e.g. 'M/d/YY, HH:mm:ss') in America/New_York; null when unavailable.",
  ),
  time_of_day: nullableString.describe(
    "Time of day of the play (HH:MM:SS); null when unavailable.",
  ),
  stadium: nullableString.describe(
    "Name of the stadium where the game was played; null when unavailable.",
  ),
  weather: nullableString.describe(
    "Weather conditions at the game (e.g. 'Clear', 'Rain'); null when unavailable.",
  ),
  nfl_api_id: nullableString.describe(
    "UUID play identifier from the NFL's internal API feed; null when unavailable.",
  ),
  play_clock: nullableString.describe(
    "Play clock value at the snap (seconds, as string); the feed currently only populates '0' or null.",
  ),
  play_deleted: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play was deleted in the NFL feed (e.g. penalized no-play), 0 otherwise, null when unknown.",
  ),
  play_type_nfl: nullableStringOf(
    z.enum([
      "GAME_START",
      "KICK_OFF",
      "RUSH",
      "PASS",
      "SACK",
      "XP_KICK",
      "END_QUARTER",
      "FIELD_GOAL",
      "PENALTY",
      "TIMEOUT",
      "PUNT",
      "PAT2",
      "END_GAME",
      "INTERCEPTION",
      "UNSPECIFIED",
      "COMMENT",
      "FUMBLE_RECOVERED_BY_OPPONENT",
      "FREE_KICK",
    ]),
  ).describe(
    "NFL feed play type: GAME_START, KICK_OFF, RUSH, PASS, SACK, XP_KICK, END_QUARTER, FIELD_GOAL, PENALTY, TIMEOUT, PUNT, PAT2, END_GAME, INTERCEPTION, UNSPECIFIED, COMMENT, FUMBLE_RECOVERED_BY_OPPONENT, or FREE_KICK; null when unavailable.",
  ),
  special_teams_play: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play was a special teams play, 0 otherwise, null when not applicable.",
  ),
  st_play_type: nullableStringOf(
    z.enum([
      "PENALTY",
    ]),
  ).describe(
    "Special teams play type from the NFL feed. Currently only PENALTY is ever populated; the feed does not populate other special teams play types.",
  ),
  end_clock_time: nullableString.describe(
    "Game clock at the end of the play (MM:SS); null when unavailable.",
  ),
  end_yard_line: nullableString.describe(
    "Yard line at the end of the play, formatted 'TEAM YARDLINE' (e.g. 'ARI 40') or '50' at midfield; null when unavailable.",
  ),
  fixed_drive: nullableFloat.describe(
    "Drive number as computed by the nflfastR 'fixed drive' logic (1-indexed).",
  ),
  fixed_drive_result: z.enum([
        "Touchdown",
        "Turnover",
        "Field goal",
        "End of half",
        "Punt",
        "Turnover on downs",
        "Missed field goal",
        "Opp touchdown",
        "Safety",
      ])
    .describe(
      "Result of the fixed drive: Touchdown, Turnover, Field goal, End of half, Punt, Turnover on downs, Missed field goal, Opp touchdown, or Safety.",
    ),
  drive_real_start_time: coercedNullableString.describe(
    "Time of day when the drive started (HH:MM:SS); null when unavailable.",
  ),
  drive_play_count: nullableFloat.describe(
    "Number of plays in the drive (1-indexed); null when unavailable.",
  ),
  drive_time_of_possession: nullableString.describe(
    "Time of possession of the drive as a clock string MM:SS (e.g. '6:00'); null when unavailable.",
  ),
  drive_first_downs: nullableFloat.describe(
    "Number of first downs earned during the drive; null when unavailable.",
  ),
  drive_inside20: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the drive entered the red zone (inside the 20-yard line), 0 otherwise, null when not applicable.",
  ),
  drive_ended_with_score: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the drive ended with a score, 0 otherwise, null when not applicable.",
  ),
  drive_quarter_start: nullableFloat.describe(
    "Quarter in which the drive started; null when unavailable.",
  ),
  drive_quarter_end: nullableFloat.describe(
    "Quarter in which the drive ended; null when unavailable.",
  ),
  drive_yards_penalized: nullableFloat.describe(
    "Yards gained from penalties by the drive team during the drive; null when unavailable.",
  ),
  drive_start_transition: nullableStringOf(
    z.enum([
      "KICKOFF",
      "FUMBLE",
      "PUNT",
      "DOWNS",
      "MISSED_FG",
      "INTERCEPTION",
      "MUFFED_PUNT",
      "BLOCKED_PUNT",
      "MUFFED_KICKOFF",
      "ONSIDE_KICK",
      "BLOCKED_FG,_DOWNS",
      "BLOCKED_PUNT,_DOWNS",
      "BLOCKED_FG",
      "UNKNOWN",
      "OWN_KICKOFF",
      "Punt",
      "Touchdown",
      "Interception",
      "Fumble",
      "Field Goal",
      "Blocked FG",
      "End of Half",
      "Missed FG",
      "Safety",
      "Downs",
      "Fumble, Safety",
      "Blocked Punt",
      "Blocked Punt, Downs",
      "Blocked FG, Downs",
      "BLOCKED_PUNT_DOWNS",
      "BLOCKED_FG_DOWNS",
      "MUFFED_FG",
    ]),
  ).describe(
    "How the drive started: KICKOFF, FUMBLE, PUNT, DOWNS, MISSED_FG, INTERCEPTION, MUFFED_PUNT, BLOCKED_PUNT, MUFFED_KICKOFF, ONSIDE_KICK, BLOCKED_FG, BLOCKED_FG,_DOWNS, BLOCKED_PUNT,_DOWNS, UNKNOWN, OWN_KICKOFF, plus equivalent mixed-case variants from older feed formats (e.g. 'Punt', 'Blocked FG', 'Fumble, Safety', 'BLOCKED_PUNT_DOWNS', 'BLOCKED_FG_DOWNS', 'MUFFED_FG'); null when unavailable.",
  ),
  drive_end_transition: nullableStringOf(
    z.enum([
      "TOUCHDOWN",
      "FUMBLE",
      "FIELD_GOAL",
      "END_HALF",
      "PUNT",
      "DOWNS",
      "END_GAME",
      "MISSED_FG",
      "INTERCEPTION",
      "SAFETY",
      "BLOCKED_PUNT",
      "BLOCKED_FG",
      "BLOCKED_FG,_DOWNS",
      "BLOCKED_PUNT,_DOWNS",
      "FUMBLE,_SAFETY",
      "UNKNOWN",
      "Punt",
      "Touchdown",
      "Interception",
      "Fumble",
      "Field Goal",
      "Blocked FG",
      "End of Game",
      "End of Half",
      "Missed FG",
      "Safety",
      "Downs",
      "Fumble, Safety",
      "Blocked Punt",
      "Blocked Punt, Downs",
      "Blocked FG, Downs",
      "BLOCKED_PUNT_DOWNS",
      "FUMBLE_SAFETY",
      "BLOCKED_FG_DOWNS",
      "BLOCKED_PUNT,_SAFETY",
    ]),
  ).describe(
    "How the drive ended: TOUCHDOWN, FUMBLE, FIELD_GOAL, END_HALF, PUNT, DOWNS, END_GAME, MISSED_FG, INTERCEPTION, SAFETY, BLOCKED_PUNT, BLOCKED_FG, BLOCKED_FG,_DOWNS, BLOCKED_PUNT,_DOWNS, FUMBLE,_SAFETY, BLOCKED_PUNT,_SAFETY (a drive ending with a blocked punt that resulted in a safety), UNKNOWN, plus equivalent mixed-case variants from older feed formats (e.g. 'Punt', 'Blocked Punt, Downs', 'FUMBLE_SAFETY', 'BLOCKED_PUNT_DOWNS'); null when unavailable.",
  ),
  drive_game_clock_start: nullableString.describe(
    "Game clock at the start of the drive as string MM:SS (e.g. '15:00'); null when unavailable.",
  ),
  drive_game_clock_end: nullableString.describe(
    "Game clock at the end of the drive as string MM:SS; null when unavailable.",
  ),
  drive_start_yard_line: nullableString.describe(
    "Yard line where the drive started (e.g. 'ARI 40' or '50'); null when unavailable.",
  ),
  drive_end_yard_line: nullableString.describe(
    "Yard line where the drive ended (e.g. 'ARI 40' or '50'); null when unavailable.",
  ),
  drive_play_id_started: coercedNullableString.describe(
    "play_id of the first play of the drive; null when unavailable.",
  ),
  drive_play_id_ended: coercedNullableString.describe(
    "play_id of the last play of the drive; null when unavailable.",
  ),
  away_score: nullableFloat.describe(
    "Away team's final score for the game.",
  ),
  home_score: nullableFloat.describe(
    "Home team's final score for the game.",
  ),
  location: z.enum(["Home", "Neutral"])
    .describe(
      "Game location: Home = played at the home team's stadium, Neutral = neutral site.",
    ),
  result: nullableFloat.describe(
    "Margin of victory from the home team's perspective (home score minus away score; positive = home win).",
  ),
  total: nullableFloat.describe(
    "Total points scored in the game (home + away).",
  ),
  spread_line: nullableFloat.describe(
    "Closing Vegas spread line (home team perspective).",
  ),
  total_line: nullableFloat.describe(
    "Closing Vegas over/under total line.",
  ),
  div_game: boolFromBinary.describe(
    "1 if the game was a divisional matchup, 0 otherwise.",
  ),
  roof: z.enum(["outdoors", "dome", "closed", "open"])
    .describe(
      "Stadium roof type: outdoors, dome, closed (retractable roof closed), or open (retractable roof open).",
    ),
  surface: nullableStringOf(
    z.enum([
      "a_turf",
      "grass",
      "sportturf",
      "fieldturf",
      "matrixturf",
      "astroturf",
      "astroplay",
      "dessograss",
      "grass ",
    ]),
  ).describe(
    "Stadium playing surface: a_turf (artificial turf), grass, sportturf, fieldturf, matrixturf, astroturf, astroplay (legacy AstroTurf surface), dessograss (Desso GrassMaster hybrid), or 'grass ' (legacy value with trailing space); null when unavailable.",
  ),
  temp: nullableFloat.describe(
    "Temperature in degrees Fahrenheit at kickoff; null when unavailable.",
  ),
  wind: nullableFloat.describe(
    "Wind speed in miles per hour at kickoff; null when unavailable.",
  ),
  home_coach: z.string().nullish().describe(
    "Full name of the home team's head coach.",
  ),
  away_coach: z.string().nullish().describe(
    "Full name of the away team's head coach.",
  ),
  stadium_id: z.string().nullish().describe(
    "nflverse stadium identifier.",
  ),
  game_stadium: z.string().nullish().describe(
    "Stadium name for the game (from schedule data).",
  ),
  aborted_play: boolFromBinary.describe(
    "1 if the play was aborted (e.g. blown dead before the snap), 0 otherwise.",
  ),
  success: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play was successful (nflfastR success definition, based on positive EPA), 0 otherwise, null when not applicable.",
  ),
  passer: nullableString.describe(
    "Full name of the passer (denormalized duplicate of passer_player_name); null on non-pass plays.",
  ),
  passer_jersey_number: coercedNullableString.describe(
    "Jersey number of the passer; null on non-pass plays.",
  ),
  rusher: nullableString.describe(
    "Full name of the rusher (denormalized duplicate of rusher_player_name); null on non-run plays.",
  ),
  rusher_jersey_number: coercedNullableString.describe(
    "Jersey number of the rusher; null on non-run plays.",
  ),
  receiver: nullableString.describe(
    "Full name of the receiver (denormalized duplicate of receiver_player_name); null when no reception.",
  ),
  receiver_jersey_number: coercedNullableString.describe(
    "Jersey number of the receiver; null when no reception.",
  ),
  pass: boolFromBinary.describe(
    "1 if the play was a pass play (dropback with a pass attempt), 0 otherwise.",
  ),
  rush: boolFromBinary.describe(
    "1 if the play was a rush attempt, 0 otherwise.",
  ),
  first_down: nullableBoolFromBinary.describe(
    "Tri-state: 1 if the play earned a first down, 0 otherwise, null when not applicable.",
  ),
  special: boolFromBinary.describe(
    "1 if the play was a special teams play, 0 otherwise.",
  ),
  play: boolFromBinary.describe(
    "1 if a real football play occurred (excludes administrative events like end of quarter, timeouts, and penalty-only plays), 0 otherwise.",
  ),
  passer_id: nullableString.describe(
    "GSIS player ID of the passer (denormalized duplicate of passer_player_id); null on non-pass plays.",
  ),
  rusher_id: nullableString.describe(
    "GSIS player ID of the rusher (denormalized duplicate of rusher_player_id); null on non-run plays.",
  ),
  receiver_id: nullableString.describe(
    "GSIS player ID of the receiver (denormalized duplicate of receiver_player_id); null when no reception.",
  ),
  name: nullableString.describe(
    "Name of the primary player who made the play (denormalized); null when unavailable.",
  ),
  jersey_number: coercedNullableString.describe(
    "Jersey number of the primary player who made the play; null when unavailable.",
  ),
  id: nullableString.describe(
    "GSIS player ID of the primary player who made the play. NOTE: this is a player ID, not the play ID; null when unavailable.",
  ),
  fantasy_player_name: nullableString.describe(
    "Fantasy player name (short format, e.g. 'A.Rodgers') for the primary player; null when unavailable.",
  ),
  fantasy_player_id: nullableString.describe(
    "Fantasy player ID for the primary player; null when unavailable.",
  ),
  fantasy: nullableString.describe(
    "Fantasy player name (duplicate of fantasy_player_name); null when unavailable.",
  ),
  fantasy_id: nullableString.describe(
    "Fantasy player ID (duplicate of fantasy_player_id); null when unavailable.",
  ),
  out_of_bounds: boolFromBinary.describe(
    "1 if the play went out of bounds, 0 otherwise.",
  ),
  home_opening_kickoff: boolFromBinary.describe(
    "1 if the home team received the opening kickoff, 0 otherwise.",
  ),
  qb_epa: nullableFloat.describe(
    "EPA on plays with a QB dropback (nflfastR); null on non-dropback plays.",
  ),
  xyac_epa: nullableFloat.describe(
    "EPA attributed to expected yards after catch (nflfastR xYAC model); null on non-pass plays.",
  ),
  xyac_mean_yardage: nullableFloat.describe(
    "Mean expected yards after catch for the completion (nflfastR xYAC model); null on non-completions.",
  ),
  xyac_median_yardage: nullableFloat.describe(
    "Median expected yards after catch for the completion (nflfastR xYAC model); null on non-completions.",
  ),
  xyac_success: nullableFloat.describe(
    "Probability (0-1) that the completion earns positive EPA on the remaining yards after catch (nflfastR xYAC model); null on non-completions.",
  ),
  xyac_fd: nullableFloat.describe(
    "Probability (0-1) that the completion earns a first down on the remaining yards after catch (nflfastR xYAC model); null on non-completions.",
  ),
  xpass: nullableFloat.describe(
    "Probability (0-1) that the play is a pass, estimated from game state (nflfastR model); null when unavailable.",
  ),
  pass_oe: nullableFloat.describe(
    "Pass rate over expected: actual pass (1 or 0) minus xpass probability for the play (nflfastR model); null when unavailable.",
  ),
});
