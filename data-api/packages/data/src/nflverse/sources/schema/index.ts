import { z } from "zod";
import { tradeSchema, teamsSchema, gamesSchema } from "./core";
import { teamStatsSchemaWeek, teamStatsSchemaSeason } from "./team-stats";
import { playerStatsSchemaWeek, playerStatsSchemaSeason } from "./player-stats";
import { ftnChartingSchema } from "./ftn-charting";
import { espnQbrSeasonalSchema, espnQbrWeeklySchema } from "./espn-qbr";
import { rosterWeeklySchema } from "./weekly-rosters";
import { playerSchema } from "./players";
import { officialsSchema } from "./officials";
import { draftPicksSchema } from "./draft-picks";
import { histContractsSchema } from "./contracts";
import { snapCountSchema } from "./snap-counts";
import { rostersSchema } from "./rosters";
import {
  pfrAdvStats_wkDef_schema,
  pfrAdvStats_wkPass_schema,
  pfrAdvStats_wkRec_schema,
  pfrAdvStats_wkRush_schema,
  pfrAdvStats_sznDef_schema,
  pfrAdvStats_sznPass_schema,
  pfrAdvStats_sznRec_schema,
  pfrAdvStats_sznRush_schema,
} from "./pfr-advstats";
import { pbpSchema } from "./pbp";
import { ngsPassingSchema, ngsReceivingSchema, ngsRushingSchema } from "./ngs";
import { injuriesSchema } from "./injuries";
import { depthChartsSchema, depthChartsLegacySchema } from "./depth-charts";
import { combineSchema } from "./combine";

export const NFLVERSE_TAG_SCHEMA = {
  // release tag -> schema (single-asset tags map directly; multi-asset tags map
  // asset base name -> schema, matching the bases produced by RELEASE_MAP)
  trades: tradeSchema,
  teams: teamsSchema,
  schedules: gamesSchema,
  stats_team: {
    stats_team_week: teamStatsSchemaWeek,
    stats_team_reg: teamStatsSchemaSeason,
    stats_team_regpost: teamStatsSchemaSeason,
    stats_team_post: teamStatsSchemaSeason,
  },
  stats_player: {
    stats_player_week: playerStatsSchemaWeek,
    stats_player_reg: playerStatsSchemaSeason,
    stats_player_regpost: playerStatsSchemaSeason,
    stats_player_post: playerStatsSchemaSeason,
  },
  ftn_charting: ftnChartingSchema,
  espn_data: {
    qbr_season_level: espnQbrSeasonalSchema,
    qbr_week_level: espnQbrWeeklySchema,
  },
  weekly_rosters: rosterWeeklySchema,
  players: playerSchema,
  officials: officialsSchema,
  draft_picks: draftPicksSchema,
  contracts: histContractsSchema,
  snap_counts: snapCountSchema,
  rosters: rostersSchema,
  pfr_advstats: {
    advstats_week_def: pfrAdvStats_wkDef_schema,
    advstats_week_pass: pfrAdvStats_wkPass_schema,
    advstats_week_rec: pfrAdvStats_wkRec_schema,
    advstats_week_rush: pfrAdvStats_wkRush_schema,
    advstats_season_def: pfrAdvStats_sznDef_schema,
    advstats_season_pass: pfrAdvStats_sznPass_schema,
    advstats_season_rec: pfrAdvStats_sznRec_schema,
    advstats_season_rush: pfrAdvStats_sznRush_schema,
  },
  pbp: pbpSchema,
  nextgen_stats: {
    ngs_passing: ngsPassingSchema,
    ngs_receiving: ngsReceivingSchema,
    ngs_rushing: ngsRushingSchema,
  },
  injuries: injuriesSchema,
  depth_charts: z.union([depthChartsSchema, depthChartsLegacySchema]),
  combine: combineSchema,
};
