import { z } from "zod";
import {
  nullableInt,
  nullableFloat,
  boolFromBinary,
  nullableCodeString,
  nullableDate,
} from "./helpers";

export const ftnChartingSchema = z.object({
  ftn_game_id: nullableInt.describe("The FTN ID of the game"),
  nflverse_game_id: z.string().nullish().describe("The NFL Verse game ID"),
  season: nullableFloat.describe("The season (year) of the game"),
  week: nullableFloat.describe("The week in the season of the game"),
  ftn_play_id: z.coerce.string().describe("The FTN ID of the play"),
  nflverse_play_id: z.coerce.string().describe("The NFL Verse ID of the play"),
  starting_hash: nullableCodeString(z.enum(["R", "L", "M"]))
    .describe(`The section of the field the ball started at. Mapping:
L=Left hash
R=Right hash
M=Middle (center)`),
  qb_location: nullableCodeString(z.enum(["U", "S", "P"]))
    .describe(`The starting position of the quarterback. Mapping:
U=Under center
S=Shotgun
P=Pistol`),
  n_offense_backfield: nullableInt.describe("The number of offensive players in the backfield"),
  n_defense_box: nullableInt.describe("The number of defenders in the box"),
  is_no_huddle: boolFromBinary.describe("Whether the play started without a huddle"),
  is_motion: boolFromBinary.describe("Whether the play had motion"),
  is_play_action: boolFromBinary.describe("Whether the play was a play-action pass (Fake rush)"),
  is_screen_pass: boolFromBinary.describe("Whether the play is a screen pass"),
  is_rpo: boolFromBinary.describe("Whether the play is a Run-Pass Option"),
  is_trick_play: boolFromBinary.describe("Whether the play is a trick play (e.g. fake punt)"),
  is_qb_out_of_pocket: boolFromBinary.describe("Whether the QB left the pocket during the play"),
  is_interception_worthy: boolFromBinary.describe("Whether the throw was interception worthy"),
  is_throw_away: boolFromBinary.describe("Whether the throw was intended to not go to anyone"),
  read_thrown: nullableCodeString(z.enum(["CHK", "1", "2", "3", "4", "SD", "DES"])).describe(
    `Which read was thrown to, if any. Mapping:
CHK=Checkdown
1-4=The numbered read in the progression
SD=Scramble drill
DES=Designed read`,
  ),
  is_catchable_ball: boolFromBinary.describe(
    "Whether the ball can be caught by the receiver or not",
  ),
  is_contested_ball: boolFromBinary.describe("Whether the ball was contested by a defender"),
  is_created_reception: boolFromBinary.describe(
    "Whether the receiver created the reception beyond what the throw gave him (e.g. had to adjust, contort, or make a difficult play to secure the catch)",
  ),
  is_drop: boolFromBinary.describe("Whether the ball was dropped by the receiver"),
  is_qb_sneak: boolFromBinary.describe(
    "Whether this is a short rush play where the QB rushes the ball to gain a first down",
  ),
  n_blitzers: nullableInt.describe("The number of blitzers (additional rushers) on the play"),
  n_pass_rushers: nullableInt.describe("The number of pass rushers (total) on the play"),
  is_qb_fault_sack: boolFromBinary.describe(
    "Whether the QB is at fault for taking the sack or not",
  ),
  date_pulled: nullableDate.describe("When this data was fetched"),
});
