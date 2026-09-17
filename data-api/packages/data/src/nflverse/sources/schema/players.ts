import { z } from "zod";
import { nullableInt, nullableString, nullableStringOf, nullableDate } from "./helpers";

export const playerSchema = z.object({
  gsis_id: z.string().nullish().describe(
    "The player's GSIS (Game Statistics and Information System) ID, the NFL's internal player identifier",
  ),
  display_name: z.string().nullish().describe("The player's display name (full name as commonly displayed)"),
  common_first_name: z.string().nullish().describe("The player's commonly used first name"),
  first_name: z.string().nullish().describe("The player's first name"),
  last_name: z.string().nullish().describe("The player's last name"),
  short_name: nullableString.describe("The player's short name"),
  football_name: nullableString.describe("The name the player goes by for football purposes (their preferred football name)"),
  suffix: nullableString.describe("The player's name suffix (e.g. Jr., II, III)"),
  esb_id: nullableString.describe("The player's ESB ID"),
  nfl_id: nullableString.describe("The player's NFL.com ID"),
  pfr_id: nullableString.describe("The player's Pro Football Reference ID"),
  pff_id: nullableString.describe("The player's Pro Football Focus ID"),
  otc_id: nullableString.describe("The player's Over the Cap ID"), // otc=over the cap
  espn_id: nullableString.describe("The player's ESPN ID"),
  smart_id: nullableString.describe(
    "The player's SMART ID (the NFL's SMART player ID used for cross-system linking)",
  ),
  birth_date: nullableDate.describe("The player's birth date (ISO 8601 date)"),
  position_group: nullableString
    .describe(
      `The player's position group. Mapping:
DL=Defensive Line
RB=Running Back
LB=Linebacker
SPEC=Special Teams
WR=Wide Receiver
DB=Defensive Back
TE=Tight End
OL=Offensive Line
QB=Quarterback`,
    ),
  position: nullableString
    .describe(
      `The player's primary position. Mapping:
NT=Nose Tackle
RB=Running Back
LB=Linebacker
K=Kicker
WR=Wide Receiver
DE=Defensive End
S=Safety
DB=Defensive Back
FS=Free Safety
OLB=Outside Linebacker
TE=Tight End
CB=Cornerback
G=Guard
OT=Offensive Tackle
DT=Defensive Tackle
C=Center
MLB=Middle Linebacker
QB=Quarterback
SAF=Safety
LS=Long Snapper
DL=Defensive Lineman
P=Punter
ILB=Inside Linebacker
OL=Offensive Lineman
FB=Fullback`,
    ),
  ngs_position_group: nullableString.describe(
    `The player's Next Gen Stats position group. Mapping:
RB=Running Back
WR=Wide Receiver
DL=Defensive Line
DB=Defensive Back
OL=Offensive Line
TE=Tight End
LB=Linebacker
QB=Quarterback
SPEC=Special Teams`,
  ),
  ngs_position: nullableString.describe(
    `The player's Next Gen Stats position. Mapping:
RB=Running Back
WR=Wide Receiver
INTERIOR_LINE=Interior Defensive Line
EDGE=Edge Rusher
HIGH_SAFETY=High Safety
SLOT_CB=Slot Cornerback
CB=Cornerback
SAFETY=Safety
G=Guard
T=Tackle
TE=Tight End
MLB=Middle Linebacker
QB=Quarterback
SLOT_WR=Slot Wide Receiver
C=Center
FB=Fullback
OLB=Outside Linebacker`,
  ),
  height: nullableInt.describe("The player's height in inches"), // inches
  weight: nullableInt.describe("The player's weight in lbs"), // lbs
  headshot: nullableStringOf(z.url()).describe("The player's headshot image URL"),
  college_name: nullableString.describe("The name of the college the player attended"),
  college_conference: nullableString.describe("The conference of the college the player attended"),
  jersey_number: nullableString.describe("The jersey number the player wears"),
  rookie_season: nullableInt.describe("The player's rookie season (year)"),
  last_season: nullableInt.describe("The most recent season the player played"),
  latest_team: z.string().nullish().describe("The most recent team (abbreviation) the player played for"),
  status: nullableStringOf(
    z.enum([
      "DEV",
      "ACT",
      "RES",
      "CUT",
      "RSN",
      "NWT",
      "RLS",
      "SUS",
      "RSR",
      "PUP",
      "EXE",
      "RET",
      "INA",
    ]),
  ).describe(
    `The player's roster status. Mapping:
DEV=On the practice squad (development)
ACT=On the active roster
RES=On the reserve list (e.g. injured reserve)
CUT=Cut from the team's roster
RSN=On the non-football injured reserve list
NWT=Not with team (waived)
RLS=Released by the team
SUS=Suspended by the league
RSR=Released from the injured reserve list
PUP=On the Physically Unable to Perform list
EXE=On the commissioner's exempt list
RET=Retired
INA=Inactive (under contract but not on the active roster)`,
  ),
  ngs_status: nullableStringOf(
    z.enum([
      "ACT",
      "CUT",
      "RES",
      "U01",
      "DEV",
      "UFA",
      "PUP",
      "TRD",
      "RET",
      "SUS",
      "RFA",
      "A02",
      "NWT",
      "EXE",
      "INA",
      "RSN",
      "TRC",
      "RSR",
      "TRT",
      "E14",
    ]),
  ).describe(
    `The player's Next Gen Stats roster status code. Mapping:
ACT=Active
CUT=Cut
RES=Reserve
U01=League status code (specific meaning not documented)
DEV=Practice squad (development)
UFA=Unrestricted free agent
PUP=Physically Unable to Perform
TRD=Traded
RET=Retired
SUS=Suspended
RFA=Restricted free agent
A02=League status code (specific meaning not documented)
NWT=Not with team
EXE=Exempt
INA=Inactive
RSN=Reserve/non-football injury
TRC=Released from the practice squad
RSR=Reserve/retired (released from the injured reserve list)
TRT=Released from the practice squad
E14=Exempt international player (International Player Pathway)`,
  ),
  ngs_status_short_description: nullableString.describe(
    "The Next Gen Stats short description of the player's status (e.g. 'Active', 'R/Injured', 'Practice Squad')",
  ),
  years_of_experience: nullableInt.describe("The player's years of NFL experience"),
  pff_position: nullableString.describe(
    `The player's Pro Football Focus position. Mapping:
DI=Defensive Interior
HB=Halfback
WR=Wide Receiver
S=Safety
LB=Linebacker
CB=Cornerback
G=Guard
ED=Edge
T=Tackle
TE=Tight End
LS=Long Snapper
FB=Fullback
K=Kicker
ST=Special Teams
QB=Quarterback
C=Center
P=Punter`,
  ),
  pff_status: nullableStringOf(
    z.enum(["A", "P", "IR", "I", "S", "IRD", "RPUP", "PINJ", "DNR", "APUP", "RNFI", "PSUS"]),
  ).describe(
    `The player's Pro Football Focus status code (PFF-specific designations). Mapping:
A=Active
P=Probable
IR=Injured Reserve
I=Injured
S=Suspended
IRD=Injured Reserve (Designated for Return)
RPUP=Reserve/Physically Unable to Perform
PINJ=Physically Injured
DNR=Did Not Report
APUP=Active/Physically Unable to Perform
RNFI=Reserve/Non-Football Injury
PSUS=Suspended (PFF designation)`,
  ),
  draft_year: nullableInt.describe("The year the player was drafted (null if undrafted)"),
  draft_round: nullableInt.describe("The round in which the player was drafted (null if undrafted)"),
  draft_pick: nullableInt.describe(
    "The overall pick number the player was drafted at (null if undrafted)",
  ),
  draft_team: nullableString.describe("The team (abbreviation) that drafted the player (null if undrafted)"),
});
