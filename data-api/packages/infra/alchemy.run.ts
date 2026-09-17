import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import "varlock/auto-load";

import type { DatabaseDO, PullDataWorkflow, WebhookDO } from "../../apps/server/src/index";

export const zone = Cloudflare.Zone.Zone("zone", {
  name: "nfl.1d.gg",
});
export const serverRuleset = Cloudflare.Ruleset.Ruleset("CacheRules", {
  zone,
  phase: "http_request_cache_settings",
  rules: [
    {
      expression: `http.request.uri.path matches "^/v1/"`,
      action: "set_cache_settings",
      actionParameters: {
        cache: true,
        edgeTtl: {
          mode: "override_origin",
          default: 86400,
        },
        cacheKey: {
          customKey: {
            queryString: {
              include: {
                list: ["season", "week", "team"],
              },
            },
          },
        },
      },
    },
  ],
});

export const dbdo = Cloudflare.DurableObject<DatabaseDO>("database-do", {
  className: "DatabaseDO",
});

export const whdo = Cloudflare.DurableObject<WebhookDO>("webhook-do", {
  className: "WebhookDO",
});

export const db = Cloudflare.D1.Database("database", {
  migrations: "../../packages/db/src/migrations",
});

export const bucket = Cloudflare.R2.Bucket("archives");
export const kv = Cloudflare.KV.Namespace("primary-kv");

export const pullDataWorkflow = Cloudflare.Workflow<PullDataWorkflow>("pull-data", {
  className: "PullDataWorkflow",
  schedules: ["0 * * * *", "30 * * * *"], // every 30 mins
});

export const whQ = Cloudflare.Queues.Queue("webhook-queue");

export const server = Cloudflare.Worker("server", {
  main: "../../apps/server/src/index.ts",
  compatibility: {
    flags: ["nodejs_compat"],
  },
  env: {
    DB: db,
    DATABASE_DO: dbdo,
    WEBHOOK_DO: whdo,
    WEBHOOK_Q: whQ,
    KV: kv,
    BUCKET: bucket,
    CORS_ORIGIN: Config.string("CORS_ORIGIN"),
    BETTER_AUTH_SECRET: Config.redacted("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: Cloudflare.Worker.URL,
  },
  dev: {
    port: 3000,
  },
});

export type ServerEnv = Cloudflare.InferEnv<typeof server>;

export default Alchemy.Stack(
  "data-api",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    yield* serverRuleset;
    const webhookQ = yield* whQ;
    const serverWorker = yield* server;
    yield* Cloudflare.Queues.Consumer("webhook-processor", {
      queueId: webhookQ.queueId,
      scriptName: serverWorker.workerName,
    });
    const webWorker = yield* Cloudflare.Website.StaticSite("web", {
      cwd: "../../apps/web",
      command: "bun run build:cloudflare",
      // Rebuild shared workspace dependencies until Alchemy has a workspace-aware default memo.
      memo: false,
      outdir: ".open-next/assets",
      main: "../../apps/web/.open-next/worker.js",
      bundle: false,
      compatibility: {
        flags: ["nodejs_compat", "global_fetch_strictly_public"],
      },
      env: {
        IMAGES: Cloudflare.Images.Images(),
        NEXT_PUBLIC_SERVER_URL: serverWorker.url.as<string>(),
      },
      dev: {
        command: "bun run dev:bare",
        url: "http://localhost:3001",
      },
    });

    return {
      web: webWorker.url,
      server: serverWorker.url,
    };
  }),
);
