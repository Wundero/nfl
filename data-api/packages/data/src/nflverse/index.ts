import { Octokit } from "@octokit/core";
import { ENV } from "../env";
import { type Storage } from "unstorage";
import PQ from "p-queue";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { arrayBuffer } from "stream/consumers";
import { WorkflowStep } from "cloudflare:workers";
import type { DatabaseDO } from "../../../../apps/server/src/index";

export const github = new Octokit({
  // auth: ENV.GITHUB_TOKEN,
});

const ASSET_EXTENSIONS_IN_ORDER = [".parquet", ".csv.gz", ".csv"] as const;

type AssetExt = (typeof ASSET_EXTENSIONS_IN_ORDER)[number];

async function loadCSVRows(data: ReadableStream) {
  const { parseBinaryStream } = await import("web-csv-toolbox");
  const iter = parseBinaryStream(data);
  return await Array.fromAsync(iter);
}

async function loadParquetRows(stream: ReadableStream) {
  const { parquetReadObjects } = await import("hyparquet");
  const data = await arrayBuffer(stream);
  return await parquetReadObjects({ file: data });
}

async function loadGzippedCSVRows(data: ReadableStream) {
  const tx = new DecompressionStream("gzip");
  return loadCSVRows(data.pipeThrough(tx));
}

async function loadRowsFromSource(data: ReadableStream, type: AssetExt) {
  switch (type) {
    case ".csv":
      return loadCSVRows(data);
    case ".csv.gz":
      return loadGzippedCSVRows(data);
    case ".parquet":
      return loadParquetRows(data);
  }
}

type ReleaseMap = Record<string, (string | ((year: number) => string))[]>;

// map: tag_name -> assets[number].name
const RELEASE_MAP: ReleaseMap = {
  trades: ["trades"],
  teams: ["teams_colors_logos"],
  schedules: ["games"],
  stats_team: [
    (year: number) => `stats_team_week_${year}`,
    (year: number) => `stats_team_reg_${year}`,
    (year: number) => `stats_team_regpost_${year}`,
    (year: number) => `stats_team_post_${year}`,
  ],
  stats_player: [
    (year: number) => `stats_player_week_${year}`,
    (year: number) => `stats_player_reg_${year}`,
    (year: number) => `stats_player_regpost_${year}`,
    (year: number) => `stats_player_post_${year}`,
  ],
  ftn_charting: [(year: number) => `ftn_charting_${year}`],
  espn_data: ["qbr_season_level", "qbr_week_level"],
  weekly_rosters: [(year: number) => `roster_weekly_${year}`],
  players: ["players"],
  officials: ["officials"],
  draft_picks: ["draft_picks"],
  contracts: ["historical_contracts"],
  snap_counts: [(year: number) => `snap_counts_${year}`],
  rosters: [(year: number) => `roster_${year}`],
  pfr_advstats: [
    (year: number) => `advstats_week_def_${year}`,
    (year: number) => `advstats_week_pass_${year}`,
    (year: number) => `advstats_week_rec_${year}`,
    (year: number) => `advstats_week_rush_${year}`,
    "advstats_season_def",
    "advstats_season_pass",
    "advstats_season_rec",
    "advstats_season_rush",
  ],
  pbp: [(year: number) => `play_by_play_${year}`],
  nextgen_stats: ["ngs_passing", "ngs_receiving", "ngs_rushing"],
  injuries: [(year: number) => `injuries_${year}`],
  depth_charts: [(year: number) => `depth_charts_${year}`],
  combine: ["combine"],
};

function expandReleases(): Record<
  string,
  {
    base: string;
    matches: string[];
  }[]
> {
  const output: Record<
    string,
    {
      base: string;
      matches: string[];
    }[]
  > = {};
  const cy = new Date().getUTCFullYear();
  Object.entries(RELEASE_MAP).forEach(([k, v]) => {
    const out: {
      base: string;
      matches: string[];
    }[] = [];
    for (const root of v) {
      if (typeof root === "string") {
        const outInner = [];
        for (const ext of ASSET_EXTENSIONS_IN_ORDER) {
          outInner.push(`${root}${ext}`);
        }
        out.push({
          base: root,
          matches: outInner,
        });
      } else {
        for (let year = 1999; year <= cy; year++) {
          const outInner = [];
          const basename = root(year);
          for (const ext of ASSET_EXTENSIONS_IN_ORDER) {
            outInner.push(`${basename}${ext}`);
          }
          out.push({
            base: basename,
            matches: outInner,
          });
        }
      }
    }
    output[k] = out;
  });
  return output;
}

const FULL_RELEASE_MAP = expandReleases();

export async function pullLatestNFLVerse(
  step: WorkflowStep,
  kv: KVNamespace,
  r2: R2Bucket,
  q: Queue,
  durableObject: DurableObjectNamespace<DatabaseDO>,
) {
  const assetsToFetch = await step.do("check-releases", async () => {
    const response = await github.request("GET /repos/{owner}/{repo}/releases", {
      owner: "nflverse",
      repo: "nflverse-data",
      headers: {
        "X-GitHub-Api-Version": "2026-03-10",
      },
      per_page: 30, // There are only 25 releases, so it should be fine
    });
    const assetsToFetch = new Map<
      string,
      {
        name: string;
        tag: string;
        digest: string;
        url: string;
      }
    >();
    for (const release of response.data) {
      const assetFilters = FULL_RELEASE_MAP[release.tag_name];
      if (!assetFilters) {
        continue;
      }
      out: for (const filter of assetFilters) {
        if (assetsToFetch.has(`${release.tag_name}:${filter.base}`)) {
          continue;
        }
        for (const withExt of filter.matches) {
          for (const asset of release.assets) {
            if (asset.name === withExt) {
              assetsToFetch.set(`${release.tag_name}:${filter.base}`, {
                name: asset.name,
                digest: asset.digest ?? "-null-",
                url: asset.browser_download_url,
                tag: release.tag_name,
              });
              continue out;
            }
          }
        }
      }
    }
    const assets = Array.from(assetsToFetch.values());
    const cks = assets.map((asset) => asset.url);
    const cachedDigests = await kv.get(cks);
    return assets.filter((asset) => {
      const cachedDigest = cachedDigests.get(asset.url);
      return cachedDigest !== asset.digest;
    });
  });

  await Promise.all(
    assetsToFetch.map((asset) =>
      step.do(`Process ${asset.url}`, async () => {
        const urlObject = new URL(asset.url);
        const path = urlObject.pathname;
        const r2Key = `github${path}`;
        const [toR2, toProcess] = await step.do(`Fetch ${asset.url}`, async () => {
          const res = await fetch(asset.url);
          if (!res.ok || !res.body) {
            return [null, null];
          }
          return res.body.tee();
        });
        const put = await step.do(`Put ${asset.url} into R2`, async () => {
          if (!toR2) {
            return null;
          }
          return await r2.put(r2Key, toR2);
        });
        await step.do(`Update KV cache for ${asset.url}`, async () => {
          if (!toR2 || !put) {
            return;
          }
          await kv.put(asset.url, asset.digest);
        });
        // TODO produce diff + upsert
        // TODO it would be ideal to minimize data going into/out of a step, since that increases cost.
        const diff = await step.do(`Produce diff for ${asset.url}`, async () => {});
        await step.do(`Upsert data to sqlite for ${asset.url}`, async () => {});
        await step.do(`Queue webhook propagation events for ${asset.url}`, async () => {});
      }),
    ),
  );
}
