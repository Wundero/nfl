import { defineRelations } from "drizzle-orm";
import * as charting from "./charting";
import * as contracts from "./contracts";
import * as depthCharts from "./depth-charts";
import * as draftCombine from "./draft-combine";
import * as espnQbr from "./espn-qbr";
import * as external from "./external";
import * as games from "./games";
import * as injuries from "./injuries";
import * as ngs from "./ngs";
import * as pfrAdvstats from "./pfr-advstats";
import * as play from "./play";
import * as playerStats from "./player-stats";
import * as reference from "./reference";
import * as snapsRosters from "./snaps-rosters";
import * as teamStats from "./team-stats";
import * as trades from "./trades";



const schema = {
  ...charting,
  ...contracts,
  ...depthCharts,
  ...draftCombine,
  ...espnQbr,
  ...external,
  ...games,
  ...injuries,
  ...ngs,
  ...pfrAdvstats,
  ...play,
  ...playerStats,
  ...reference,
  ...snapsRosters,
  ...teamStats,
  ...trades,
};

export const relations = defineRelations(schema, (r) => ({
  combine_result: {
    player: r.one.player({ from: r.combine_result.playerId, to: r.player.id, optional: true }),
  },
  contract: {
    player: r.one.player({ from: r.contract.playerId, to: r.player.id, optional: true }),
    history: r.many.contract_history({ from: r.contract.id, to: r.contract_history.contractId }),
  },
  contract_history: {
    contract: r.one.contract({ from: r.contract_history.contractId, to: r.contract.id }),
  },
  depth_chart: {
    player: r.one.player({ from: r.depth_chart.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.depth_chart.teamId, to: r.team.id, alias: "depth_team", optional: true }),
  },
  draft_pick: {
    player: r.one.player({ from: r.draft_pick.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.draft_pick.teamId, to: r.team.id, alias: "draft_team", optional: true }),
  },
  espn_qbr_season: {
    player: r.one.player({ from: r.espn_qbr_season.playerId, to: r.player.id, optional: true }),
    teamRef: r.one.team({ from: r.espn_qbr_season.teamId, to: r.team.id, alias: "qbr_s_team", optional: true }),
  },
  espn_qbr_week: {
    player: r.one.player({ from: r.espn_qbr_week.playerId, to: r.player.id, optional: true }),
    teamRef: r.one.team({ from: r.espn_qbr_week.teamId, to: r.team.id, alias: "qbr_w_team", optional: true }),
  },
  ftn_charting: {
    game: r.one.game({ from: r.ftn_charting.gameId, to: r.game.id, optional: true }),
  },
  game: {
    homeTeam: r.one.team({ from: r.game.homeTeamId, to: r.team.id, alias: "game_home_team", optional: true }),
    awayTeam: r.one.team({ from: r.game.awayTeamId, to: r.team.id, alias: "game_away_team", optional: true }),
    homeQb: r.one.player({ from: r.game.homeQbId, to: r.player.id, alias: "game_home_qb", optional: true }),
    awayQb: r.one.player({ from: r.game.awayQbId, to: r.player.id, alias: "game_away_qb", optional: true }),
    officials: r.many.game_official({ from: r.game.id, to: r.game_official.gameId }),
    playerStats: r.many.player_week_stats({ from: r.game.id, to: r.player_week_stats.gameId }),
    teamStats: r.many.team_week_stats({ from: r.game.id, to: r.team_week_stats.gameId }),
    snapCounts: r.many.snap_count({ from: r.game.id, to: r.snap_count.gameId }),
    ftnCharting: r.many.ftn_charting({ from: r.game.id, to: r.ftn_charting.gameId }),
    plays: r.many.play({ from: r.game.id, to: r.play.gameId }),
  },
  game_official: {
    game: r.one.game({ from: r.game_official.gameId, to: r.game.id }),
    official: r.one.official({ from: r.game_official.officialId, to: r.official.id }),
  },
  injury_report: {
    player: r.one.player({ from: r.injury_report.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.injury_report.teamId, to: r.team.id, alias: "inj_team", optional: true }),
  },
  ngs_passing: {
    player: r.one.player({ from: r.ngs_passing.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.ngs_passing.teamId, to: r.team.id, alias: "ngs_pass_team", optional: true }),
  },
  ngs_receiving: {
    player: r.one.player({ from: r.ngs_receiving.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.ngs_receiving.teamId, to: r.team.id, alias: "ngs_rec_team", optional: true }),
  },
  ngs_rushing: {
    player: r.one.player({ from: r.ngs_rushing.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.ngs_rushing.teamId, to: r.team.id, alias: "ngs_rush_team", optional: true }),
  },
  official: {
    games: r.many.game_official({ from: r.official.id, to: r.game_official.officialId }),
  },
  pfr_adv_def_season: {
    player: r.one.player({ from: r.pfr_adv_def_season.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_def_season.teamId, to: r.team.id, alias: "pfr_adv_def_season_team", optional: true }),
  },
  pfr_adv_def_week: {
    player: r.one.player({ from: r.pfr_adv_def_week.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_def_week.teamId, to: r.team.id, alias: "pfr_adv_def_week_team", optional: true }),
  },
  pfr_adv_pass_season: {
    player: r.one.player({ from: r.pfr_adv_pass_season.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_pass_season.teamId, to: r.team.id, alias: "pfr_adv_pass_season_team", optional: true }),
  },
  pfr_adv_pass_week: {
    player: r.one.player({ from: r.pfr_adv_pass_week.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_pass_week.teamId, to: r.team.id, alias: "pfr_adv_pass_week_team", optional: true }),
  },
  pfr_adv_rec_season: {
    player: r.one.player({ from: r.pfr_adv_rec_season.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_rec_season.teamId, to: r.team.id, alias: "pfr_adv_rec_season_team", optional: true }),
  },
  pfr_adv_rec_week: {
    player: r.one.player({ from: r.pfr_adv_rec_week.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_rec_week.teamId, to: r.team.id, alias: "pfr_adv_rec_week_team", optional: true }),
  },
  pfr_adv_rush_season: {
    player: r.one.player({ from: r.pfr_adv_rush_season.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_rush_season.teamId, to: r.team.id, alias: "pfr_adv_rush_season_team", optional: true }),
  },
  pfr_adv_rush_week: {
    player: r.one.player({ from: r.pfr_adv_rush_week.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.pfr_adv_rush_week.teamId, to: r.team.id, alias: "pfr_adv_rush_week_team", optional: true }),
  },
  play: {
    players: r.many.play_player({ from: r.play.id, to: r.play_player.playId }),
    teams: r.many.play_team({ from: r.play.id, to: r.play_team.playId }),
    game: r.one.game({ from: r.play.gameId, to: r.game.id, optional: true }),
    posteamRef: r.one.team({ from: r.play.posteamId, to: r.team.id, alias: "play_posteam", optional: true }),
    defteamRef: r.one.team({ from: r.play.defteamId, to: r.team.id, alias: "play_defteam", optional: true }),
  },
  player: {
    playPlayers: r.many.play_player({ from: r.player.id, to: r.play_player.playerId }),
    latestTeam: r.one.team({ from: r.player.latestTeamId, to: r.team.id, optional: true }),
    homeQbGames: r.many.game({ from: r.player.id, to: r.game.homeQbId, alias: "game_home_qb" }),
    awayQbGames: r.many.game({ from: r.player.id, to: r.game.awayQbId, alias: "game_away_qb" }),
    weekStats: r.many.player_week_stats({ from: r.player.id, to: r.player_week_stats.playerId }),
    seasonStats: r.many.player_season_stats({ from: r.player.id, to: r.player_season_stats.playerId }),
    snapCounts: r.many.snap_count({ from: r.player.id, to: r.snap_count.playerId }),
    weeklyRosters: r.many.roster_weekly({ from: r.player.id, to: r.roster_weekly.playerId }),
    seasonRosters: r.many.roster_season({ from: r.player.id, to: r.roster_season.playerId }),
    injuries: r.many.injury_report({ from: r.player.id, to: r.injury_report.playerId }),
    ngsPassing: r.many.ngs_passing({ from: r.player.id, to: r.ngs_passing.playerId }),
    ngsReceiving: r.many.ngs_receiving({ from: r.player.id, to: r.ngs_receiving.playerId }),
    ngsRushing: r.many.ngs_rushing({ from: r.player.id, to: r.ngs_rushing.playerId }),
    qbrSeasons: r.many.espn_qbr_season({ from: r.player.id, to: r.espn_qbr_season.playerId }),
    qbrWeeks: r.many.espn_qbr_week({ from: r.player.id, to: r.espn_qbr_week.playerId }),
    draftPicks: r.many.draft_pick({ from: r.player.id, to: r.draft_pick.playerId }),
    combineResults: r.many.combine_result({ from: r.player.id, to: r.combine_result.playerId }),
    contracts: r.many.contract({ from: r.player.id, to: r.contract.playerId }),
    pfrDefSeason: r.many.pfr_adv_def_season({ from: r.player.id, to: r.pfr_adv_def_season.playerId }),
    pfrPassSeason: r.many.pfr_adv_pass_season({ from: r.player.id, to: r.pfr_adv_pass_season.playerId }),
    pfrRushSeason: r.many.pfr_adv_rush_season({ from: r.player.id, to: r.pfr_adv_rush_season.playerId }),
    pfrRecSeason: r.many.pfr_adv_rec_season({ from: r.player.id, to: r.pfr_adv_rec_season.playerId }),
    pfrDefWeek: r.many.pfr_adv_def_week({ from: r.player.id, to: r.pfr_adv_def_week.playerId }),
    pfrPassWeek: r.many.pfr_adv_pass_week({ from: r.player.id, to: r.pfr_adv_pass_week.playerId }),
    pfrRecWeek: r.many.pfr_adv_rec_week({ from: r.player.id, to: r.pfr_adv_rec_week.playerId }),
    pfrRushWeek: r.many.pfr_adv_rush_week({ from: r.player.id, to: r.pfr_adv_rush_week.playerId }),
    depthChart: r.many.depth_chart({ from: r.player.id, to: r.depth_chart.playerId }),
  },
  player_season_stats: {
    player: r.one.player({ from: r.player_season_stats.playerId, to: r.player.id }),
    team: r.one.team({ from: r.player_season_stats.teamId, to: r.team.id, alias: "pss_team", optional: true }),
  },
  player_week_stats: {
    player: r.one.player({ from: r.player_week_stats.playerId, to: r.player.id }),
    team: r.one.team({ from: r.player_week_stats.teamId, to: r.team.id, alias: "pws_team", optional: true }),
    opponentTeamRef: r.one.team({ from: r.player_week_stats.opponentTeamId, to: r.team.id, alias: "pws_opponent", optional: true }),
    game: r.one.game({ from: r.player_week_stats.gameId, to: r.game.id, optional: true }),
  },
  roster_season: {
    player: r.one.player({ from: r.roster_season.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.roster_season.teamId, to: r.team.id, alias: "rs_team", optional: true }),
  },
  roster_weekly: {
    player: r.one.player({ from: r.roster_weekly.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.roster_weekly.teamId, to: r.team.id, alias: "rw_team", optional: true }),
  },
  snap_count: {
    game: r.one.game({ from: r.snap_count.gameId, to: r.game.id, optional: true }),
    player: r.one.player({ from: r.snap_count.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.snap_count.teamId, to: r.team.id, alias: "snap_team", optional: true }),
    opponentTeam: r.one.team({ from: r.snap_count.opponentTeamId, to: r.team.id, alias: "snap_opponent", optional: true }),
  },
  team: {
    playPlayers: r.many.play_player({ from: r.team.id, to: r.play_player.teamId }),
    playTeams: r.many.play_team({ from: r.team.id, to: r.play_team.teamId }),
    players: r.many.player({ from: r.team.id, to: r.player.latestTeamId }),
    homeGames: r.many.game({ from: r.team.id, to: r.game.homeTeamId, alias: "game_home_team" }),
    awayGames: r.many.game({ from: r.team.id, to: r.game.awayTeamId, alias: "game_away_team" }),
    playerWeekStats: r.many.player_week_stats({ from: r.team.id, to: r.player_week_stats.teamId, alias: "pws_team" }),
    playerWeekStatsOpponent: r.many.player_week_stats({ from: r.team.id, to: r.player_week_stats.opponentTeamId, alias: "pws_opponent" }),
    playerSeasonStats: r.many.player_season_stats({ from: r.team.id, to: r.player_season_stats.teamId, alias: "pss_team" }),
    teamWeekStats: r.many.team_week_stats({ from: r.team.id, to: r.team_week_stats.teamId, alias: "tws_team" }),
    teamWeekStatsOpponent: r.many.team_week_stats({ from: r.team.id, to: r.team_week_stats.opponentTeamId, alias: "tws_opponent" }),
    teamSeasonStats: r.many.team_season_stats({ from: r.team.id, to: r.team_season_stats.teamId, alias: "tss_team" }),
    snapCounts: r.many.snap_count({ from: r.team.id, to: r.snap_count.teamId, alias: "snap_team" }),
    snapCountsOpponent: r.many.snap_count({ from: r.team.id, to: r.snap_count.opponentTeamId, alias: "snap_opponent" }),
    weeklyRosters: r.many.roster_weekly({ from: r.team.id, to: r.roster_weekly.teamId, alias: "rw_team" }),
    seasonRosters: r.many.roster_season({ from: r.team.id, to: r.roster_season.teamId, alias: "rs_team" }),
    injuries: r.many.injury_report({ from: r.team.id, to: r.injury_report.teamId, alias: "inj_team" }),
    playsAsPosteam: r.many.play({ from: r.team.id, to: r.play.posteamId, alias: "play_posteam" }),
    playsAsDefteam: r.many.play({ from: r.team.id, to: r.play.defteamId, alias: "play_defteam" }),
    ngsPassing: r.many.ngs_passing({ from: r.team.id, to: r.ngs_passing.teamId, alias: "ngs_pass_team" }),
    ngsReceiving: r.many.ngs_receiving({ from: r.team.id, to: r.ngs_receiving.teamId, alias: "ngs_rec_team" }),
    ngsRushing: r.many.ngs_rushing({ from: r.team.id, to: r.ngs_rushing.teamId, alias: "ngs_rush_team" }),
    qbrSeasons: r.many.espn_qbr_season({ from: r.team.id, to: r.espn_qbr_season.teamId, alias: "qbr_s_team" }),
    qbrWeeks: r.many.espn_qbr_week({ from: r.team.id, to: r.espn_qbr_week.teamId, alias: "qbr_w_team" }),
    draftPicks: r.many.draft_pick({ from: r.team.id, to: r.draft_pick.teamId, alias: "draft_team" }),
    tradesGave: r.many.trade({ from: r.team.id, to: r.trade.gaveTeamId, alias: "trade_gave" }),
    tradesReceived: r.many.trade({ from: r.team.id, to: r.trade.receivedTeamId, alias: "trade_received" }),
    pfrDefSeason: r.many.pfr_adv_def_season({ from: r.team.id, to: r.pfr_adv_def_season.teamId, alias: "pfr_adv_def_season_team" }),
    pfrPassSeason: r.many.pfr_adv_pass_season({ from: r.team.id, to: r.pfr_adv_pass_season.teamId, alias: "pfr_adv_pass_season_team" }),
    pfrRushSeason: r.many.pfr_adv_rush_season({ from: r.team.id, to: r.pfr_adv_rush_season.teamId, alias: "pfr_adv_rush_season_team" }),
    pfrRecSeason: r.many.pfr_adv_rec_season({ from: r.team.id, to: r.pfr_adv_rec_season.teamId, alias: "pfr_adv_rec_season_team" }),
    pfrDefWeek: r.many.pfr_adv_def_week({ from: r.team.id, to: r.pfr_adv_def_week.teamId, alias: "pfr_adv_def_week_team" }),
    pfrPassWeek: r.many.pfr_adv_pass_week({ from: r.team.id, to: r.pfr_adv_pass_week.teamId, alias: "pfr_adv_pass_week_team" }),
    pfrRecWeek: r.many.pfr_adv_rec_week({ from: r.team.id, to: r.pfr_adv_rec_week.teamId, alias: "pfr_adv_rec_week_team" }),
    pfrRushWeek: r.many.pfr_adv_rush_week({ from: r.team.id, to: r.pfr_adv_rush_week.teamId, alias: "pfr_adv_rush_week_team" }),
    depthChart: r.many.depth_chart({ from: r.team.id, to: r.depth_chart.teamId, alias: "depth_team" }),
  },
  team_season_stats: {
    team: r.one.team({ from: r.team_season_stats.teamId, to: r.team.id, alias: "tss_team", optional: true }),
  },
  team_week_stats: {
    team: r.one.team({ from: r.team_week_stats.teamId, to: r.team.id, alias: "tws_team", optional: true }),
    opponentTeamRef: r.one.team({ from: r.team_week_stats.opponentTeamId, to: r.team.id, alias: "tws_opponent", optional: true }),
    game: r.one.game({ from: r.team_week_stats.gameId, to: r.game.id, optional: true }),
  },
  trade: {
    gaveTeam: r.one.team({ from: r.trade.gaveTeamId, to: r.team.id, alias: "trade_gave", optional: true }),
    receivedTeam: r.one.team({ from: r.trade.receivedTeamId, to: r.team.id, alias: "trade_received", optional: true }),
  },
  play_player: {
    play: r.one.play({ from: r.play_player.playId, to: r.play.id }),
    player: r.one.player({ from: r.play_player.playerId, to: r.player.id, optional: true }),
    team: r.one.team({ from: r.play_player.teamId, to: r.team.id, optional: true }),
  },
  play_team: {
    play: r.one.play({ from: r.play_team.playId, to: r.play.id }),
    team: r.one.team({ from: r.play_team.teamId, to: r.team.id, optional: true }),
  },
}));
