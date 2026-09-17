import { z } from "zod";
import { nullableFloat, nullableString } from "./helpers";

export const snapCountSchema = z.object({
  game_id: z.string().nullish().describe("nflverse game id (e.g. '2026_01_ARI_LAC')"),
  pfr_game_id: z.string().nullish().describe("Pro-Football-Reference game identifier"),
  season: nullableFloat.describe("Season year"),
  game_type: z.enum(["REG", "WC", "DIV", "CON", "SB"]).describe("Game type: REG=Regular Season, WC=Wild Card, DIV=Divisional Playoff, CON=Conference Championship, SB=Super Bowl"),
  week: nullableFloat.describe("Week number of the season"),
  player: z.string().nullish().describe("Player full name"),
  pfr_player_id: z.string().nullish().describe("Pro-Football-Reference player identifier"),
  position: nullableString.describe("Player position as listed by Pro-Football-Reference; slash-separated values are combined/hybrid position labels: G=Guard, T=Tackle, C=Center, QB=Quarterback, TE=Tight End, WR=Wide Receiver, RB=Running Back, FB=Fullback, FS=Free Safety, SS=Strong Safety, LB=Linebacker, CB=Cornerback, NT=Nose Tackle, DT=Defensive Tackle, DE=Defensive End, K=Kicker, LS=Long Snapper, P=Punter, S=Safety, DB=Defensive Back, OL=Offensive Lineman, DL=Defensive Lineman, HB=Halfback, ILB=Inside Linebacker, OLB=Outside Linebacker, OT=Offensive Tackle, MLB=Middle Linebacker, OG=Offensive Guard"),
  team: z.string().nullish().describe("Team abbreviation"),
  opponent: z.string().nullish().describe("Opponent team abbreviation"),
  offense_snaps: nullableFloat.describe("Number of offensive snaps played"),
  offense_pct: nullableFloat.describe("Fraction (0-1) of the team's offensive snaps played by this player"),
  defense_snaps: nullableFloat.describe("Number of defensive snaps played"),
  defense_pct: nullableFloat.describe("Fraction (0-1) of the team's defensive snaps played by this player"),
  st_snaps: nullableFloat.describe("Number of special teams snaps played"),
  st_pct: nullableFloat.describe("Fraction (0-1) of the team's special teams snaps played by this player"),
});
