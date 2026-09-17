# AI Fantasy League — Data Schema & Trading Protocol

## Design philosophy

Since you want "more data = more better" for the *league* while different algo types consume it differently, the right pattern is a **firehose feed + tiered access**, not a fixed feature set:

- Every algo gets the same raw JSON feed each week — full transparency, no info asymmetry.
- A `core` bundle is always attached inline (small, cheap, always relevant).
- `extended` bundles (play-by-play history, college stats, coach tendencies) are available as referenced URLs/files an algo can pull if it wants — this keeps LLM context bounded while letting an XGBoost pipeline ingest everything.
- A shared **feature-extraction layer** turns raw JSON into a flat numeric table for tree-based models, so you only build that logic once and every stats-based algo can reuse it.

---

## 1. Weekly Data Envelope (sent to every algo)

```json
{
  "week": 4,
  "season": 2026,
  "league_state": {
    "scoring_format": "half_ppr",
    "roster_slots": ["QB","RB","RB","WR","WR","TE","FLEX","DST","K","BENCHx6"],
    "waiver_deadline": "2026-09-17T12:00:00Z",
    "trade_deadline_week": 12
  },
  "your_roster": ["player_id", "..."],
  "available_players": ["player_id", "..."],
  "core": { "...": "see section 2" },
  "extended_refs": {
    "play_by_play": "s3://league-data/pbp/2026/week4.parquet",
    "college_stats": "s3://league-data/college/2026.parquet",
    "coach_history": "s3://league-data/coaches/tendencies.json"
  },
  "pending_trades": [ "...see section 4..." ]
}
```

## 2. Core Bundle — per player, per week

| Category | Fields | Notes |
|---|---|---|
| **Identity** | player_id, name, position, team, age, exp_years, draft_capital | Static/slow-changing |
| **Usage** | snaps_pct, routes_run, target_share, air_yards_share, rz_touches, carries, targets, aDOT | Highest-value predictive tier |
| **Production (lagged)** | fantasy_pts_by_format[std/half/ppr], last_4wk_avg, last_4wk_stdev, season_avg | Include *your league's* actual scoring formula too |
| **Team context** | implied_team_total, spread, plays_per_game, pass_rate_over_expected | From Vegas lines — very strong signal |
| **Matchup** | opp_def_rank_vs_position, opp_pace, opp_pass_rate_allowed | Positional, not team-overall |
| **Situational** | home_away, rest_days, dome_outdoor, wind_mph, temp_f, primetime_flag | |
| **Health** | injury_status, practice_participation_trend, games_missed_szn | Status matters far more than history |
| **Market** | consensus_adp, expert_rank_avg, player_props[anytime_td_odds, yards_ou] | Props are underrated — Vegas-priced player-level signal |

## 3. Extended Bundles (opt-in / pull-based)

- **Play-by-play** (nflverse/nflfastR-style): every snap since 1999 — for algos building their own EPA/CPOE-style features.
- **College stats** (cfbfastR / CFBD): mainly useful for players in year 1–2.
- **Coach tendencies**: aggregate play-calling stats by coordinator tenure — thin signal, but let algos that want it pull it.
- **Historical head-to-head**: include for completeness, flagged low-sample-size in metadata so algos know not to over-weight it.
- **Career-long fantasy logs**: full history, since some algos (or an LLM doing its own reasoning) may want it even though recency usually dominates.

Flagging bundles with a `sample_size` or `signal_strength_hint` metadata field is optional but useful context — you're not hiding information, just being honest about its shape.

## 4. How each algo type actually uses this

**XGBoost / stats models**
Run the JSON through a feature-extraction script → flat numeric matrix, one row per player-week. Train per position. This is the only algo type that benefits meaningfully from the extended bundles at scale (more rows/columns it can search over).

**LLM agents**
Send the `core` bundle only, as JSON, plus a system prompt describing scoring rules and roster constraints. Let it request an extended bundle by name if it wants more (function-calling style) rather than dumping everything into context every week — keeps cost sane and avoids drowning genuinely useful signal in noise. Require it to return a strict JSON action schema (see below) — never free text for the actual decision.

**Pure RNG**
Only needs `available_players` and `roster_slots` — legal-action list. Give it the full envelope anyway for consistency, it just ignores everything but the action space.

## 5. Standard Action Schema (all algos return this)

```json
{
  "lineup": { "QB": "player_id", "RB1": "player_id", "...": "..." },
  "waiver_claims": [{"add": "player_id", "drop": "player_id", "priority": 1}],
  "trade_proposals": [{"to_team": "team_id", "offer": ["player_id"], "request": ["player_id"]}],
  "trade_responses": [{"trade_id": "t123", "action": "accept|reject|counter", "counter": {...}}]
}
```

Uniform I/O means you can swap algo implementations without touching league infrastructure.

---

## 6. Trading Protocol

Trading between algos is the trickiest part because the algos are wildly mismatched in sophistication — an RNG bot can't defend a bad trade, and an LLM agent is exposed to **adversarial input** from other agents' trade messages (a free-text "pitch" field is effectively a prompt-injection surface into your LLM agent). Design around both problems:

**a) Structured offers only — no free text.**
Trade proposals are `{offer: [...], request: [...]}` data, not persuasive messages. This removes the injection surface and forces every algo to evaluate trades on data, not rhetoric.

**b) Async proposal window, not real-time negotiation.**
Give each week a trade phase (e.g., 24–48hr): proposals submitted → target algos evaluate on their own schedule → accept/reject/counter, capped at 2–3 counter-rounds to avoid infinite loops between two models that keep re-negotiating. LLM calls are slower/costlier than XGBoost inference, so this also keeps the league sync-able across heterogeneous algo speeds.

**c) Neutral fairness check (protects weak/naive algos).**
Compute a league-wide "consensus value" for every player each week — e.g., rest-of-season points projection × your scoring format, blended across a simple baseline model everyone shares. Flag (or auto-veto, your call) trades where the value delta exceeds a threshold. This is exactly what real fantasy platforms already do for collusion protection, and here it also protects the RNG bot from getting fleeced by a smarter model, and protects an LLM from being talked into (or roleplayed into) a lopsided deal.

**d) Decide whether vetoes are automatic or commissioner-reviewed.**
Automatic threshold-based veto is more "fair," but a human-reviewed veto queue is more interesting if part of the point is watching how algos negotiate — you could log flagged trades without blocking them, just for post-season analysis of which algo is the best (or worst) negotiator.

**e) Log everything.**
Since this is as much an experiment as a league, keep a full trade ledger (proposal → counters → resolution → the fairness-check score) — it's genuinely interesting data on which architecture negotiates well, separate from which one drafts or sets lineups well.

---

## 7. Agentic LLM Algo (tool-calling)

Give this algo the `core` bundle as its prompt, plus a set of **read-only research tools** it can call before committing to a decision:

```
get_player_extended_stats(player_id, weeks=N)
get_college_stats(player_id)
get_play_by_play(player_id, weeks=N)
get_coach_tendencies(team_id)
get_opponent_roster(team_id)         # other rosters are public info in real fantasy anyway
get_vegas_lines(week)
get_injury_timeline(player_id)
```

Key design points:

- **Separate research from action.** Tools only *read*; the only way the agent affects the league is by returning the final structured action schema (Section 5). This means a confused or manipulated agent can call ten weird tools and still can't do anything except submit one valid JSON action at the end — bounds the blast radius of a bad reasoning chain.
- **Cap the loop.** Give it a tool-call budget (e.g., 8–12 calls) and a wall-clock timeout. Force a final answer once either is hit — otherwise you'll eventually get an agent that spirals querying data forever, especially once you're paying per-call.
- **Cache aggressively.** Multiple agents will ask for the same opponent's coach tendencies or the same player's college stats in the same week — cache tool results server-side so you're not re-computing (or re-billing) identical lookups.
- **Log the full trace.** Prompt, every tool call + result, and final decision. This is genuinely one of the most interesting outputs of the whole project — you'll be able to see *why* the agentic bot benched someone, not just that it did.
- **Always have a fallback.** If the agent times out, errors, or returns malformed JSON, fall back to a simple heuristic (e.g., "start highest projected points at each slot"). Never let one broken agent stall the league.

---

## 8. RNGBot Trade Math

Your instinct (`rng() * trade_value > threshold`) is close, but multiplying two 0–1 quantities compounds them in a way that skews rejection — even a maximally good trade (`trade_value = 1`) still needs `rng() > 0.5`, a flat 50% ceiling, while a perfectly fair trade (`0.5`) can *never* clear a `> 0.5` bar. Cleaner is to treat `trade_value` itself as the **acceptance probability** and draw once against it:

```
accept = random.uniform(0, 1) < trade_value_for_me
```

Then the only real work is mapping trade value onto a clean 0–1 scale. Use the same neutral consensus valuation model from Section 6c (rest-of-season projected points, blended across a shared baseline) and pass the delta through a sigmoid so it's naturally bounded and centered on fairness:

```
delta = value_received - value_given            # in projected points
trade_value_for_me = 1 / (1 + exp(-k * delta))  # k tunes sensitivity
```

- `delta = 0` (perfectly fair trade) → `trade_value = 0.5` → 50/50 coin flip. Feels right for a bot with no real judgment.
- `k` controls how "smart-looking" RNGbot appears: low `k` (e.g. 0.05) keeps it noisy and exploitable even on lopsided trades — funnier, more chaotic. Higher `k` (e.g. 0.5+) makes it behave almost rationally, rejecting bad trades reliably.
- Optional: clip the final probability to something like `[0.05, 0.95]` so it's never *guaranteed* to accept or reject — keeps a bit of true randomness in character even at the extremes.

Worth publishing RNGbot's `trade_value_for_me` alongside its decision in the trade log — watching other algos learn to exploit a known, public acceptance curve is itself a fun emergent dynamic.

---

## 9. Cadence: Scheduled vs. Event-Driven

Pure batch scheduling (run everything 2–3x/week) is simpler but misses exactly the moments that matter most in real fantasy: an inactive-list release, a Wednesday injury downgrade, a same-day trade offer. Pure event-driven with instant triggers is more realistic but risks exactly what you flagged — an LLM agent doesn't get a fair shot if "game starts in 5 seconds" is the trigger.

**Recommended: event-driven with built-in lead time, not instant reaction.** Each event type gets a *decision window* — a trigger point and a deadline, not a trigger-and-immediately-lock:

| Event | Trigger | Deadline given to agents |
|---|---|---|
| Inactive list released | ~90 min before kickoff (real NFL pattern) | Kickoff − 60 min (lock buffer), giving ~30 min runway |
| Injury status change | Debounced — batch changes over a 15 min window | Same day, several hours out |
| Trade offered | Immediately notify recipient | 24h response window, not instant |
| Waiver period opens | Weekly, after MNF | Scheduled, not event-driven — this one's fine as batch |
| Weekly lineup lock | Hard deadline (kickoff of each player's game) | N/A — this *is* the deadline |

Two things matter more than the event taxonomy itself:

1. **Debounce noisy events.** Injury news and odds movements can fire many times in a short window — batch them into one trigger per team per debounce period rather than re-invoking an agent (especially an LLM one) on every micro-update.
2. **Always have a timeout fallback.** If an agent doesn't respond by the deadline, fall back to its last-known lineup or a simple default heuristic. This is non-negotiable for a league that mixes algo speeds — an LLM call that hangs or errors shouldn't be able to freeze a whole week.

For infrastructure, you don't need anything heavyweight at hobby-league scale: a scheduled poller (every 15–30 min) that diffs current external state (injury reports, inactive lists, odds) against the last snapshot and emits events on changes, feeding a simple per-team queue with deadlines, is enough. No need for a full event-streaming platform for this.

---

## 10. Language Split & the TS/Rust Boundary

**Where Rust actually earns its place vs. where it's just extra work:**

| Component | Recommended language | Why |
|---|---|---|
| Next.js visualization site | TypeScript | Obvious |
| League engine / event scheduler / orchestration | TypeScript | Glue code, I/O-bound, no reason to leave the ecosystem |
| LLM agent (prompting + tool-calling loop) | TypeScript | The Vercel AI SDK (or similar) is TS-native and this is mostly API orchestration, not compute |
| RNGBot, rule-based bots | TypeScript | Trivial logic, no reason for Rust |
| Stats model (XGBoost-style) | **Rust** | The one place raw compute + training actually benefits from it |
| Data ingestion / feature extraction | Rust *or* embedded — see below | Parsing/joining large play-by-play data is where Rust's speed matters |

For the stats model specifically: the `xgboost` Rust crate binds to the real libxgboost (works fine, just means linking a C++ lib in your Docker image); `lightgbm3` is a lighter alternative binding. If you want zero C bindings at all, `linfa`/`smartcore` cover simpler tree ensembles in pure Rust, though with less maturity than XGBoost itself.

**Worth knowing:** the nflverse data (Section 1) is published as static parquet/CSV files, not behind a Python-only API — so there's no need to run Python anywhere in this stack. **DuckDB** is a strong fit for the ingestion/feature layer since it embeds directly in both Rust (`duckdb-rs`) and Node (`duckdb-node`), reads parquet natively, and can do the join/aggregation work in SQL without you hand-rolling a pipeline in either language.

### NAPI vs. HTTP API — pick one, and HTTP is the better default here

NAPI-RS gives you in-process, zero-serialization calls from Node into Rust — great latency, but it ties you to a single machine/runtime and doesn't survive contact with your stated cloud plan: Cloudflare Workers can't load native addons at all (isolate-based, JS/Wasm only), and Vercel's Node.js serverless functions *can* load `.node` binaries but only outside the Edge runtime, with real friction around matching build target OS/arch. Since you're explicitly open to Vercel/Cloudflare later and already planning to containerize non-TS pieces at that point, building two separate integration paths (NAPI for local, HTTP for cloud) is avoidable work.

**Recommendation: run the Rust stats model as an HTTP service (axum) from day one, even locally.** Locally that's just `cargo run` alongside `bun dev` — no Docker needed for local dev. When you're ready for the "friends can play too" version, the exact same service goes into a container, unchanged. This also happens to match what you're already doing with [[llm-router-proxy]]'s Fly.io execution layer, so you'd be reusing an infra pattern you already have rather than inventing a new one.

For the TS↔Rust contract, don't hand-maintain matching types on both sides — use `utoipa` (Rust) to generate an OpenAPI spec from your axum routes, then `openapi-typescript` to generate the TS client types from that spec. Keeps both sides honestly in sync without a manual schema.

### Deployment note (current as of research)

Cloudflare Containers reached general availability in April 2026, so — if the multi-user version ends up on Cloudflare — you could actually run the Rust service as a Cloudflare Container behind a Worker rather than needing a separate host entirely. Cost-wise, that's billed per-active-CPU-time and separately for memory, which article comparisons suggest gets more expensive than a small always-on VM once the service is persistent rather than bursty — so for a stats model that's mostly idle between weekly triggers, Containers' burst pricing may actually suit it well; for anything you'd want running continuously, a small Fly.io/Vultr box (which you already have infra patterns for) is likely still cheaper. Worth checking current Cloudflare Container pricing against your expected usage pattern before committing either way.

---

## 11. Data Sources Reachable from TypeScript/Rust

The good news: almost nothing in the NFL/CFB data ecosystem actually requires Python or R — most of it is either plain HTTP/JSON or static files, both trivially callable from `fetch`/`reqwest`.

### NFL — nflverse (the main source from Section 1)
The nflverse data itself is **just static files on GitHub Releases** — CSV, parquet, or RDS, updated nightly during the season. The R/Python packages (`nflreadr`, `nfl_data_py`) are just convenience wrappers around downloading these files; you don't need either language. From TS or Rust you can `fetch`/`reqwest` the release URLs directly, e.g.:
```
https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2026.parquet
https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats.parquet
https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_2026.csv
```
For parquet in Rust, the `parquet`/`arrow` crates (or `polars`, which wraps both and adds a nice query API) read these directly. In TS/Node, `duckdb-node` can query parquet files over HTTP without downloading them first, or `parquet-wasm`/`hyparquet` for a pure-JS reader if you'd rather avoid DuckDB.

### Fantasy scoring & league state — Sleeper API
Free, read-only, **no API key required**, plain REST/JSON — about as TS/Rust-friendly as an API gets. Covers users, leagues, rosters, drafts, transactions, and a trending-adds/drops endpoint. There's an unofficial `sleeper-wrapper` npm package if you want the convenience layer, but the raw endpoints are simple enough to hit directly with `fetch`.

### College football — CollegeFootballData.com (CFBD)
CFBD shipped an official **TypeScript SDK** for its v2 REST API (alongside Python and C#), so this is first-class from TS. Free tier is 1,000 calls/month, which is plenty for weekly batch pulls. For Rust, there's no official SDK, but the API is a standard OpenAPI-documented REST service — generate a Rust client from their OpenAPI spec (`openapi-generator` or `progenitor`) rather than hand-writing one.

### Vegas lines / player props — The Odds API (and alternatives)
Plain REST/JSON, easy from either language — but worth knowing before you build around it: **the free tier only covers NBA and MLB**; NFL/NCAAF require the paid Professional tier ($29/mo) and player props specifically require the Business tier ($99/mo). If props matter to your feature set and you want to stay free, look at alternatives like SharpAPI or Sports Game Odds, which both advertise NFL-inclusive free tiers with lower request limits — worth comparing current limits against your actual polling cadence before picking one.

### What to skip
ESPN's hidden/undocumented API shows up constantly in football-analytics tutorials — it works and is JSON, but it's unofficial, undocumented, and has broken or changed shape without notice in the past. Fine for a hobby prototype, but not something to build a paid or shared league around without a fallback source.

### Rust-side plumbing summary
No dedicated NFL/CFB crate ecosystem exists (it's a small niche relative to Python's), so the pattern is: `reqwest` + `serde` for REST APIs (CFBD, Sleeper, odds), and `parquet`/`arrow`/`polars` for the static nflverse files. This is genuinely less code than it sounds like — most of the "hard part" (scraping/cleaning) is already done upstream by nflverse; you're just fetching and parsing already-clean files.

---

## 12. A Dedicated Aggregation/Storage Layer

Yes — this is worth building as its own service rather than having each algo (or your orchestrator) hit CFBD/Sleeper/nflverse/odds APIs directly. Reasons it earns the extra piece:

- **Shared rate limits.** CFBD's free tier is 1,000 calls/month total — that's a per-account limit, not per-consumer. If your XGBoost pipeline, your LLM agent's tool calls, and your Next.js site all hit it independently, you'll blow through it fast. One ingestion layer that polls on your event schedule (Section 9) and caches the result serves everyone from one budget.
- **Schema normalization.** Every upstream source has its own shape. Doing that translation once, into the envelope from Section 1, means your algos and your website never touch raw CFBD/Sleeper/nflverse JSON at all.
- **Resilience.** If CFBD reshapes a response or nflverse renames a column, you fix it in one ingestion job instead of hunting through every consumer.
- **Sets up "public" for free later.** If you do open this to friends, the aggregation API is already the public surface — you're adding auth/rate-limiting to something that exists, not building a new thing under time pressure.

**Storage mapping**, using Cloudflare's own design philosophy (many small, purpose-scoped stores rather than one big database — this is explicitly how D1 is meant to be used: it caps at 10GB per database *by design*, expecting you to shard by natural boundary like season or league rather than have one giant DB):

| Data | Store | Why |
|---|---|---|
| Raw archival pulls (full nflverse parquet dumps, historical CFBD responses) | **R2** | Cheap, no egress fees, natural fit for immutable blobs; DuckDB/Polars can query parquet directly off R2 (S3-compatible) without downloading first |
| Normalized "core bundle" query tables (Section 2) | **D1**, sharded per-season or per-domain | Structured, relational, queried frequently by your orchestrator and stats model — this is exactly D1's sweet spot, as long as you don't try to cram all-time play-by-play into one database |
| Live league/team state (rosters, pending trades, event queue) | **Durable Objects** (SQLite-backed) | Per-entity strong consistency is exactly what DOs are for — one DO per team or league maps naturally onto your event-driven design from Section 9; a DO's alarm feature is a clean fit for the decision-window deadlines |

One thing worth checking before serving any of this publicly: several of your sources have redistribution terms attached — nflverse data is released under CC-BY-SA 4.0 (attribution required), Sleeper's free API is explicitly for non-commercial use only, and CFBD/odds providers typically have their own caching/redistribution clauses in their terms. Fine for personal or friends-and-family use, but worth a read of each source's terms before this becomes a public product, especially if monetization ever enters the picture.

---

## 13. Prior Art

**Closest direct match — an all-LLM fantasy league already exists.** A blog post, ["What I Learned Starting an AI-only Fantasy Football League"](https://brooklynhacker.com/post/794518431273762816/what-i-learned-running-an-ai-only-fantasy-football), documents a group of friends who each picked one LLM to manage their team for a season, with rules almost identical in spirit to what you're describing: every decision must come from the model, arbitrary tooling/prompting/RAG allowed around it, and a "grand jury" mechanic for underperforming teams. It's single-model-per-manager rather than the algo-architecture diversity (XGBoost/LLM/RNG) you're going for, but it's a strong real-world data point on the social/operational side — what breaks, what's fun to watch, how a season actually plays out.

**Academic treatment of a very similar problem.** [FanCric](https://arxiv.org/pdf/2410.01307) is a multi-agent LLM framework specifically for building fantasy cricket teams — different specialized agents handle different parts of the roster-construction decision. It's the closest peer-reviewed analog to "have an agentic system reason about fantasy sports roster construction," just for cricket instead of football.

**Existing engineering tooling worth knowing about.** [Fantasy-Football-AI-CoManager](https://github.com/JayMishra-source/Fantasy-Football-AI-CoManager) is an open-source, LLM-agnostic fantasy football automation project with ESPN API integration and an MCP server — not a multi-algo competition, but useful reference for how someone else structured LLM-driven lineup/waiver/trade logic against a real fantasy platform.

**Broader research context for the "different agent architectures compete" framing.** There's an active research area on LLM agents in strategic/economic multi-agent settings — papers like *Alympics* (game-theoretic scenarios with LLM agents) and studies of LLM agents in simulated markets look at exactly the kind of dynamics your trading protocol will surface: negotiation, exploitation of weaker agents, emergent strategy. None of it is fantasy-football-specific, but it's the right literature to skim if you want a framework for *analyzing* what happens once your bots start trading with each other.

**Structurally similar (non-LLM) prior art worth stealing from.** Bot-vs-bot competition platforms like Kaggle Simulations (Halite, Lux AI) solve almost exactly your engineering problem in a different domain: a standardized environment + action-schema contract that arbitrary bot implementations (any language, any architecture) compete against each other through. Their approach to turn structure, replay logging, and language-agnostic bot interfaces is worth a look as a template for your own action-schema and event-loop design, independent of the football-specific content.

---

## 14. Data Licensing for a Public API

This one's genuinely source-by-source rather than a single blanket answer — the sources you're relying on span a real range from "explicitly redistributable" to "explicitly prohibited without permission." (Not legal advice — this is a factual reading of what each provider currently publishes; if the public API gets real usage, having an actual lawyer glance at your terms page is worth the modest cost.)

| Source | License posture | What "properly handled" means |
|---|---|---|
| **nflverse** | CC-BY-SA 4.0, attribution required (specifically "to FTN Data via nflverse" for the FTN-charted subset) | You *can* redistribute this publicly. Two obligations: attribute it clearly, and — because it's ShareAlike — the portion of your API that re-serves this data should itself be offered under a compatible open license, not locked up as proprietary-only |
| **CollegeFootballData (CFBD)** | Explicitly states in their terms: *"Reselling or redistributing data obtained from the API without explicit permission"* is prohibited | This is a hard stop, not a soft ask — a public API re-serving CFBD data is close to a textbook violation of their terms as written. Email them before launch; a free hobby project asking permission is a very different conversation than the one their terms are guarding against, and they may well say yes |
| **Sleeper** | Free for read-only use, but their docs state plainly: *"For commercial use of the Sleeper API, please reach out to us directly to discuss licensing"* | Ambiguous for a free-but-public project — "commercial" isn't strictly defined, and it's unclear whether "free but publicly available" counts. Cheapest path: ask them directly rather than guess |
| **Odds/props providers** | Varies by vendor, but betting data is typically the most tightly licensed category in this whole stack — most explicitly prohibit redistribution or resale outside your own product | Treat this as the strictest tier by default. If you want odds data in a public API, check that specific vendor's terms closely, or don't re-serve raw odds fields publicly at all |

**Practical architecture that respects this:**

1. **Keep a provenance ledger.** For every field in your normalized schema, track which source it came from and that source's license/redistribution terms. This is what lets you answer "can I show this publicly" per-field instead of all-or-nothing.
2. **Split your public surface from your internal one.** Everything can flow into your internal aggregation layer (Section 12) for your own algos to use — that's just consumption, the least restrictive use case for nearly every source's terms. The public API is a narrower, separately-curated slice.
3. **Public-safe by default: your own computed outputs.** Predictions, rankings, and derived analysis that your models produce are your own work product, not a redistribution of someone else's licensed data — these are the safest things to expose publicly regardless of upstream terms.
4. **Public-safe with attribution: nflverse-derived data.** Its license explicitly permits this.
5. **Gated behind permission: CFBD, Sleeper, odds data.** Either email the provider before launch (cheap, and CFBD's own wording implies they grant exceptions), or don't pass their raw fields through your public API — only use them internally, and let public users optionally bring their own API key for anything you can't legally re-serve yourself (a proxy pattern rather than a redistribution pattern).

---

## 15. Fantasy Scoring Across Platforms

Good news here: these aren't proprietary algorithms at all — every major platform (ESPN, Yahoo, NFL.com, Sleeper) publishes its scoring rules directly, because leagues need to see and customize them before drafting. There's nothing to reverse-engineer.

**They're also all the same shape.** Every platform computes fantasy points as a linear function over the same underlying box-score categories (yards, TDs, receptions, turnovers), plus a handful of non-linear pieces (yardage-threshold bonuses, tiered defense points-allowed bands). The *categories* are shared infrastructure; only the *weights* differ. Concretely, defaults across platforms:

| Stat | ESPN default | Yahoo default | NFL.com default |
|---|---|---|---|
| Passing TD | 4 pts | 4 pts | 4 pts |
| Passing yards | 1 pt / 25 yds | 1 pt / 25 yds | 1 pt / 25 yds |
| Rush/Rec TD | 6 pts | 6 pts | 6 pts |
| Rush/Rec yards | 1 pt / 10 yds | 1 pt / 10 yds | 1 pt / 10 yds |
| Reception | 0 (standard) / 0.5 / 1, league choice | 0.5 (half-PPR is Yahoo's default) | 1 (full PPR is NFL.com's default) |
| INT thrown / Fumble lost | −2 | −2 | −2 |

The main real differences between platforms are the reception default (half-PPR vs. full PPR vs. standard) and the defense/DST points-allowed tier boundaries — everything else is nearly identical.

**Design: one generic scoring engine, config-driven, not per-platform special cases.**

```json
{
  "per_stat": {
    "pass_yd": 0.04, "pass_td": 4, "pass_int": -2,
    "rush_yd": 0.1, "rush_td": 6,
    "rec": 0.5, "rec_yd": 0.1, "rec_td": 6,
    "fumble_lost": -2, "two_pt_conv": 2
  },
  "yardage_bonuses": [
    {"stat": "pass_yd", "threshold": 300, "bonus": 3},
    {"stat": "rush_yd", "threshold": 100, "bonus": 2}
  ],
  "dst_points_allowed_tiers": [
    {"max": 0, "points": 10}, {"max": 6, "points": 7}, {"max": 13, "points": 4}
  ]
}
```
Run any platform's box-score stats through the same function with a different config, and you get that platform's score. Ship presets — `espn_standard`, `espn_ppr`, `yahoo_half_ppr`, `nfl_ppr`, plus a fully custom option — as starting templates for someone creating a league.

**One useful shortcut specific to Sleeper:** since Sleeper's own API already exposes a real league's live `scoring_settings` as a flat JSON object, you can import a real league's exact settings directly as a config with just a key-name translation layer — no guessing needed for that platform at all.

**Worth being upfront about in the product itself:** these are *defaults*, and real leagues customize them constantly (TE premium, 6-point passing TDs, custom bonus thresholds, IDP scoring). "Match ESPN's scoring" should be framed as "match ESPN's out-of-the-box defaults," not "replicate any specific real ESPN league" — the latter requires that league's actual custom settings, not just knowing which platform it's hosted on.

---

## 16. Open-Sourcing the Aggregator: Code License vs. Data License

These are two separate questions, and separating them is what makes MIT workable here.

**The code itself: MIT is fine, and is the standard choice for exactly this kind of project.** Your aggregator's ingestion logic, normalization schema, scoring engine, and API server are your own work — nothing about the upstream data sources' terms restricts what license *you* put on *your code*. This is a well-established pattern: CFBD's own official Python and TypeScript SDKs are open source, `cfbfastR` (the R college-football package) is MIT-licensed, and none of that conflicts with CFBD's restrictive data-redistribution terms — because the code and the data are licensed independently. The clean way to structure it:

- MIT license on the whole repo.
- The code requires each user to supply their **own** API keys/credentials for gated sources (CFBD, Sleeper, odds providers). That means each person running your open-source tool is individually bound by those providers' terms through their own key — not routed through you. This is the difference between "I open-sourced a tool that fetches data" (fine) and "I'm redistributing the data itself" (the thing that needs permission, per Section 14).
- Don't check gated sources' data into the repo as fixtures/cached files — mock data for tests, not real scraped dumps.
- For the one source that *is* freely redistributable — nflverse's CC-BY-SA data — you can bundle or cache it freely, just add a `DATA-LICENSE.md` alongside your `LICENSE` (MIT) clarifying that the code is MIT but any bundled nflverse-derived data remains CC-BY-SA with attribution. Repos mixing an MIT/permissive code license with a separately-licensed open dataset is a common, well-understood pattern — it just needs to be stated clearly, not left implicit.

**The hosted public API is a separate decision from the GitHub license.** Open-sourcing your code doesn't change what your *running service* is allowed to serve publicly — that's still governed by Section 14's per-source rules regardless of what license sits on the repo. You could reasonably MIT the code today and still keep the hosted API's public surface limited to nflverse-derived data + your own model outputs until CFBD/Sleeper get back to you.

## 17. Other Openly-Licensed College Football Sources

Being direct about this one: there isn't a clean CFB equivalent to nflverse at the same depth — CFBD is the deepest source and it's the one with the explicit no-redistribution clause. A few genuine options, with honest caveats:

- **SportsDataverse** (the project behind `cfbfastR`) is philosophically the closest thing — an explicitly "open sports data initiative" with MIT-licensed code, and it ships pre-built season datasets (ESPN-derived and stats.ncaa.org-derived play-by-play, rosters, box scores) via its own `sportsdataverse-data` GitHub Releases, no API key needed. That said, I could not find an explicit data-license statement for that release repo the way nflverse explicitly states CC-BY-SA for its data. The *code* being MIT doesn't automatically mean the underlying ESPN/NCAA-derived *data* carries a redistribution grant — worth directly asking the maintainer (Saiem Gilani, listed on the project) before treating it as safe to redistribute publicly. Given the project's whole ethos is open sports data, they may well be receptive to clarifying or even formalizing a license if asked — worth trying.
- **Wikidata** is genuinely and explicitly CC0 (public domain dedication) — no ambiguity at all. It has structured data on college football teams, conferences, and season/game results queryable via SPARQL. The catch is depth: it's nowhere near CFBD's granularity (no play-by-play, no advanced stats), but it's a completely clean source for lightweight metadata like team/conference reference data or historical season results.
- **Kaggle-hosted CFB datasets** often carry permissive licenses (CC0, MIT) as labeled by the uploader — but worth treating with real skepticism as a redistribution source for your own public API: the label reflects what the *uploader* claims, not necessarily a right they actually had to grant, especially when the underlying data was itself scraped from CFBD or ESPN. Fine for offline model prototyping; not a substitute for confirming the original source's actual terms.

Net recommendation: for CFB, plan on the "ask CFBD for permission" path from Section 14 as your primary route to a legitimately public dataset at real depth, treat SportsDataverse as a promising secondary option worth a direct question to its maintainers, and use Wikidata as a clean (if thin) supplementary source you can redistribute without asking anyone.

---

## 18. Automated Ingestion: Not One Cron Job — Tiered, Diff-Aware, Retry-Safe

A single daily poll undersells fast-moving sources and oversells slow ones. Match cadence to how often each source actually changes:

| Source | Real update cadence | Poll accordingly |
|---|---|---|
| nflverse full data (pbp, player stats) | Updated nightly during season | Once daily is already matching the source, not under-polling |
| CFBD | Changes with games/weekly, and it's rate-limited (1,000 calls/month) | Weekly batch pulls, whole-week/whole-season endpoints rather than per-player calls |
| Injury reports | Practice-report cadence (Wed/Thu/Fri) plus off-cycle news | A few times a day during the week, more on Sun morning |
| Odds/lines | Move continuously, especially post-injury-news | Coarse early in the week, tighter as kickoff approaches |
| Inactive lists | Released ~90 min before kickoff, narrow window | Dedicated tight-interval check *only* during that window per game, not all day |
| Sleeper league state (rosters, trades, waivers) | Whenever managers/algos act | Frequent enough to catch same-day moves; doesn't need sub-minute polling |

**Mechanism: Cloudflare Workflows with attached cron schedules, not bare Cron Triggers.** As of mid-2026, Workflows can have cron schedules attached directly to the binding (multiple schedules on one Workflow), and every scheduled run gets Workflows' built-in retries, durable multi-step state, and timeouts. This matters because plain Cron-Triggered Workers have real gaps for anything where a missed run has consequences: no automatic retries, no failure alerting, and a hard 3–5 trigger cap per Worker. A nightly cache purge can live on a bare Cron Trigger; your actual data pipeline shouldn't — a transient upstream 500 from CFBD silently dropping a week's ingestion until someone notices is exactly the failure mode Workflows' retry/durability model exists to prevent.

Structure each ingestion run as Workflow steps: `fetch → parse → normalize → diff-against-last-known → write (R2/D1) → emit event if changed`. Each step gets its own retry/backoff for free, and a long-running one (e.g., a full-season parquet pull) can safely span longer than a single request without you building resume logic by hand.

**Diff before you write — this is also your event system.** Store a hash or version marker per dataset; only write deltas rather than blindly overwriting every poll (D1 charges per row written, so this is also a cost lever). The delta itself *is* the event that feeds Section 9's decision-window design — when the diff step finds a real change (injury status flipped, inactive designation posted), publish it to Cloudflare Queues, and let the per-team/per-league Durable Objects from Section 12 consume it and act on their own deadline logic. Ingestion and event-detection end up being the same pipeline, not two separate systems.

**For the genuinely narrow windows (inactive-list release), don't rely on generic cadence at all.** Once you ingest the week's schedule (Monday), programmatically schedule a dedicated check — a Durable Object alarm or a directly-triggered Workflow instance — timed to each game's kickoff-minus-buffer, rather than running a tight poll interval all week for something that only matters in a 90-minute window per game.

**Locally, none of this changes in kind, just in tooling.** A Bun scheduled script (or plain `cron`) calling the same fetch→parse→diff→write pipeline is fine for local dev — you don't need Workflows' reliability guarantees on your own machine. The point of writing the pipeline as discrete steps from day one is that porting it to Workflows later is wiring, not a rewrite.

---

## 19. Webhook Fan-Out for the Public Aggregator API

Good instinct that per-account subscription limits alone are weak — that caps growth, not cost. The actual cost lever is **coalescing**, not gatekeeping. Design so that the cost of a delivery is driven by "how many distinct batched deliveries happen," which you control directly, rather than "raw events × subscriber count," which you don't.

### Pipeline

```
diff step (Section 18) → Queue: raw-events
                              ↓
                    fanout-matcher (Queue consumer)
                    looks up matching subscriptions via KV topic index
                              ↓
              per-subscription Durable Object (WebhookBufferDO)
              buffers events, sets an alarm, flushes on debounce/threshold
                              ↓
                    Queue: webhook-deliveries (signed, batched payload)
                              ↓
                    delivery-worker (Queue consumer) → POST to subscriber
                              ↓ (on repeated failure)
                    DLQ + auto-pause subscription
```

**Why a Durable Object per subscription for buffering, not a shared buffer:** DO alarms are exactly the "coalesce writes, flush after quiet period" primitive Cloudflare's own docs use this pattern for. Each subscription's DO independently accumulates matched events and fires its own alarm at its own debounce interval — a burst of 40 injury-report updates lands as one batched webhook call per subscriber, not 40.

**Why Queues between each stage rather than direct calls:** Queues give you retry-with-backoff and a Dead Letter Queue for free, at per-operation pricing (fractions of a cent per thousand operations) rather than infrastructure you'd otherwise hand-roll. One nuance worth designing around: Queues retries the *whole batch* if a single message in it fails, unless you explicitly acknowledge the good ones — so the fanout-matcher should ack each event individually rather than let one malformed event cause a retry storm across unrelated ones.

### Keeping request/cost counts down

- **Debounce window is subscriber-configurable**, trading latency for volume: `realtime` (a short ~5–10s micro-debounce just to coalesce a burst) vs. `batched_5min`/`batched_hourly`. Most consumers — including your own internal sim — don't need sub-second delivery, only delivery within their own decision-window tolerance (Section 9), so batched is a fine and cheap default.
- **Scope subscriptions at creation time.** Require a topic filter (resource types, optionally specific team/player IDs) rather than allowing "everything." This bounds both delivery volume and subscriber-side load — nobody should be getting a global firehose by default.
- **Index topic → subscription lookups in KV, not a D1 scan per event.** D1 is the source of truth for subscription records; a KV-cached topic index (rebuilt on subscription changes) keeps the hot-path lookup cheap and fast at high event volume.
- **Workers bill active CPU time, not wall-clock.** A delivery worker mostly waiting on a slow-but-not-broken subscriber's response isn't burning your budget the way it would on a platform billed by request duration — this matters because it means tolerating slow subscribers is cheap; only genuinely high *volume* needs control, not subscriber latency.
- **Auto-pause dead endpoints.** Track consecutive delivery failures per subscription; after a threshold (e.g., 5 full-retry failures), pause it and notify rather than continuing to burn retries and DLQ writes on something that's been down for days.

### Authn/authz

- **Control plane (managing subscriptions):** per-account bearer API key, hash stored in D1 (cached in KV for fast validation), with **scopes** attached — e.g., free tier can subscribe to team/game-level events only, a higher tier unlocks per-player granularity. Enforce at subscription-creation time, not just at delivery.
- **Delivery authenticity:** standard HMAC signing (same pattern as Stripe/GitHub webhooks) — `Webhook-Signature: t=<timestamp>,v1=<HMAC-SHA256(secret, timestamp + "." + body)>`. Reject on the subscriber's end if the timestamp is more than a few minutes old, to block replay. Support secret rotation with a grace period where both old and new secrets validate.
- **Endpoint ownership/SSRF protection, easy to overlook:** don't just accept whatever URL someone registers. Do a verification handshake at creation (send a random challenge, require it echoed back before activating), and reject URLs resolving to private/loopback/link-local IP ranges — both at creation *and* at delivery time, since DNS can be re-pointed after the initial check (classic time-of-check/time-of-use gap). Otherwise your fan-out infrastructure is a ready-made SSRF tool against internal networks.
- **The real backstop beyond per-account subscription counts:** a per-account token-bucket cap on aggregate delivery *attempts* per minute (in a DO or KV), independent of subscription count, plus a per-endpoint concurrency cap so a burst never hammers one subscriber's server in parallel. This is what actually bounds worst-case cost — subscription-count limits alone don't, since one busy topic could still fan out huge volume through very few subscriptions.

### Don't route your own internal sim through this

Since you're keeping the league/sim concept fully separate from this API, the fantasy-sim's own consumption of deltas (Section 9's event-driven design) should subscribe directly to the `raw-events` Queue (or a filtered branch of it) as a first-class internal consumer — not through the public webhook/HTTP/signing pipeline. It's your own trusted process; there's no reason to pay the HTTP round-trip and signature overhead that external subscribers need. The public webhook system and the internal sim end up as sibling consumers of the same underlying event stream, which is exactly the decoupling you're going for by splitting the aggregator out.

---

## 20. Caching Strategy for the Public Data API

One correction worth making up front: for a Worker serving its **own** computed JSON (not proxying to another origin via `fetch()`), Cloudflare doesn't cache it at the edge automatically just because you set `Cache-Control` — that automatic pathway is for Workers that `fetch()` an upstream origin. For a Worker that *is* the origin, you need either the explicit **Cache API** (`caches.default.put()/match()`) in your code, or a **Cache Rule** on the route set to "Eligible for cache" + "respect origin Cache-Control" so a hit gets served before your Worker even runs. The Cache Rule path is the cheaper one when it fits, since a hit costs zero Worker invocations.

### The key move: let your diff pipeline drive purge, not just TTL

You already have, from Section 18, a per-resource version hash generated the moment something actually changes. Reuse it three ways at once:
1. As the **ETag** on that resource's API response (the Cache API natively evaluates `If-None-Match` against it — no extra code needed for 304s).
2. As the **webhook change-detection key** (already built).
3. As a **Cache-Tag** for active purging — tag every cached response with its resource identifiers (`player:4046`, `team:SEA`, `week:2026-4`), and when the diff step fires, purge exactly those tags via Cloudflare's purge-by-tag API in the same step that enqueues the webhook event.

This changes the whole TTL philosophy: instead of short TTLs doing the work of freshness (poll-and-hope), TTL becomes a *ceiling* — a worst-case staleness bound in case a purge is ever missed — while actual freshness comes from active invalidation the instant data changes. That means you can set **longer** TTLs than you'd otherwise feel safe with, which directly improves your cache hit ratio without sacrificing correctness. One operational detail worth knowing: purge-by-tag only works cleanly with cache keys defined via Cache Rules, not custom keys built by hand inside Worker code — so define your cache key normalization (which query params matter — season/week/team/player, not tracking params or auth tokens) at the Cache Rules level, not in JS.

### Cache-Control tiers by data category

| Category | Example | Edge TTL (ceiling) | Notes |
|---|---|---|---|
| Closed historical (past seasons, finalized games) | Completed game box scores | `max-age=31536000, immutable` | Never changes, never gets purged — simplest tier, no invalidation logic needed at all |
| Reference/slow-moving | Team info, mid-season rosters | `max-age=3600, stale-while-revalidate=86400` | Purged on the rare actual change; long ceiling is fine since purge handles real updates |
| Weekly stats (open correction window) | This week's player stats, pre-Wed-correction | `max-age=300, stale-while-revalidate=3600` | Purge-driven freshness matters most here — corrections land as a purge + webhook event, not a wait-for-TTL |
| Live/current-day | Injury status, live odds, in-game state | `max-age=15-30` | Short ceiling mainly to stop repeat-poll cost within a few seconds; this tier is what your webhook/event system exists to serve properly — cache freshness here is a backstop, not the delivery mechanism |

Use `stale-while-revalidate` broadly — it means a stale hit still gets served instantly while your Worker refreshes it in the background, so cache misses never show up as latency spikes for the caller. `stale-if-error` is worth adding too: if D1/R2 has a hiccup, callers still get the last good cached response instead of an error, essentially free resilience.

**Cache key discipline:** never let the cached response vary by caller identity or tier — auth/rate-limiting should gate *how often* someone can call, not *what content* they get back. If a free vs. paid tier ever needs different response shapes, that's a different endpoint or an explicit query param, not something baked into a shared cache key — otherwise you risk one tier's cached response leaking to another, and you fragment your cache hit ratio for no reason.

### Does caching help webhook costs? Indirectly, but genuinely

Caching doesn't make webhook delivery itself cheaper — but it removes load from the system in three real ways:

1. **Shared infrastructure, not duplicated work.** The same version-hash that drives cache invalidation *is* the webhook change-detection signal (Section 18/19). One diff event does double duty — purge the cache tag and enqueue the webhook — instead of computing "did this change" twice.
2. **A cheap cached reconciliation endpoint reduces how bulletproof webhook delivery needs to be.** Expose a lightweight, heavily-cached `GET /v1/sync-token` (or per-resource-type cursor) that returns the latest version marker. Webhook subscribers can poll this occasionally — cheap, since it's cache-hit-served almost every time — to detect a missed delivery and catch up, rather than you needing exhaustive guaranteed-delivery/replay infrastructure in the webhook system itself. This shifts reliability burden from expensive push-side engineering onto a nearly-free cached pull-side fallback.
3. **Fewer webhook subscribers in the first place.** Anyone who only needs "check occasionally, don't need push" can get by with conditional GET (`If-None-Match` against the cached ETag) instead of registering a webhook at all — cheap 304s for them, one less subscription for your fan-out system to carry.

---

## 21. Configuring Cache Rules as Code

Short answer: it's not Wrangler. Wrangler's config file (`wrangler.jsonc`) manages **Worker-level** resources — bindings, routes, crons, KV/D1/R2 attachments. Cache Rules are a **zone-level** product (same tier as WAF rules, redirects, transform rules) configured through Cloudflare's Rulesets API, which sits outside what Wrangler's schema covers entirely. So the "cloudflare.config.ts"-shaped answer you're picturing isn't a Wrangler file — it's a separate infra-as-code resource pointed at your zone.

**The actual resource, across every tool, is the same thing under the hood:** a ruleset in the `http_request_cache_settings` phase. This is exposed identically in:

- **Terraform** — `cloudflare_ruleset` with `phase = "http_request_cache_settings"`. This is the most mature, most-documented path; the official Cloudflare provider, most examples online, most Stack Overflow/GitHub issue coverage if something goes wrong.
- **Pulumi** — same resource (`cloudflare.Ruleset`), since Pulumi's Cloudflare provider is bridged from the Terraform provider — same fields, same phase string, occasionally a version or two behind on brand-new Cloudflare features since it inherits from upstream.
- **Alchemy** — `Cloudflare.Ruleset`, a native TypeScript resource (`import { Ruleset, Zone } from "alchemy/cloudflare"`), which given your stack is genuinely worth a serious look: you'd define your cache rules in the same TypeScript tool and file structure as your Workers, D1, R2, and Queues — no second IaC language, no context-switching to HCL for just this one piece. The trade-off is that Alchemy is newer and smaller than Terraform, so weigh that maturity gap against the convenience if this becomes something you depend on heavily.
- **Dashboard** — fine for prototyping the rule shape before you've settled on it, but not something to leave as the source of truth once you want this reproducible/version-controlled alongside the rest of your infrastructure.

Example shape (Alchemy):
```ts
import { Ruleset, Zone } from "alchemy/cloudflare";

const zone = await Zone("api-zone", { name: "yourapi.com" });

await Ruleset("api-cache-rules", {
  zone,
  phase: "http_request_cache_settings",
  rules: [
    {
      expression: `http.request.uri.path matches "^/v1/games/"`,
      action: "set_cache_settings",
      action_parameters: {
        cache: true,
        edge_ttl: { mode: "override_origin", default: 86400 },
        cache_key: { custom_key: { query_string: { include: ["season", "week", "team"] } } },
      },
    },
  ],
});
```

This is also where the custom cache key from Section 20 belongs — defining it here (rather than hand-building a `Request` key inside your Worker's JS) is what keeps it purge-by-tag compatible.

**One dependency worth flagging:** Cache Rules operate on zone traffic, so this requires your API to be on a custom domain you've added to Cloudflare as a zone — a bare `workers.dev` subdomain isn't a zone you configure Cache Rules against. Putting the API on your own domain is standard practice anyway, but worth having settled before wiring this up.

**Recommendation given your stack:** since Wrangler already manages your Workers in TypeScript, Alchemy is the most consistent choice if you're comfortable being an early adopter of a newer tool; Terraform is the safer default if you'd rather lean on the most battle-tested path for this one zone-level piece and don't mind it being the one non-TS file in the repo.

---

## 22. Schema: Drizzle + Durable Object SQLite (sharded)

Confirmed current API (as of this writing): Drizzle's DO driver is `drizzle-orm/durable-sqlite`, instantiated as `drizzle(ctx.storage)` inside the Durable Object class, with migrations run via `drizzle-orm/durable-sqlite/migrator` and a `drizzle.config.ts` set to `dialect: 'sqlite', driver: 'durable-sqlite'`. Worth knowing as background: D1 itself is actually built on the same underlying Durable Object SQLite storage layer — so you're not giving anything up moving to DO directly, you're just getting the dynamic-addressing layer D1's binding model doesn't expose, which is exactly the "D1 sharding is nontrivial" problem you're routing around.

### Sharding key: season

Shard by season (`env.SEASON_SHARD.idFromName("2026")`), not by team or resource type. Reasoning: it's the natural boundary nflverse/CFBD already publish data in, it matches how almost every real query is scoped ("this week," "this season's stats"), and it keeps shard count small and predictable (one new shard per year) rather than growing unboundedly. Within each season's DO, keep all resource types as separate tables — a season's worth of even play-by-play data is well within a single DO SQLite instance's comfortable range, no need to split further.

The real cost of this choice: cross-season queries (career history) need to fan out to multiple DOs and merge in the Worker — there's no cross-DO join. That's fine for a bounded, small number of seasons (fan out to the last 3-5 season-shards, cheap), but keep a lightweight non-sharded index (a KV map or a small "registry" DO) of which seasons a given player has data in, so you're not blindly querying every season-shard ever created for a career lookup.

### Schema

```ts
import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),          // e.g. "SEA"
  name: text('name').notNull(),
  conference: text('conference'),
  division: text('division'),
});

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),          // your canonical id
  gsisId: text('gsis_id'),              // nflverse's id, for joining
  espnId: text('espn_id'),
  sleeperId: text('sleeper_id'),
  name: text('name').notNull(),
  position: text('position').notNull(),
  teamId: text('team_id').references(() => teams.id),
  draftYear: integer('draft_year'),
  draftCapital: text('draft_capital'), // "R2P14" style, keep as string
  college: text('college'),
  source: text('source').notNull(),     // provenance — Section 14
}, (t) => ({
  positionIdx: index('players_position_idx').on(t.position),
}));

export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  season: integer('season').notNull(),
  week: integer('week').notNull(),
  homeTeamId: text('home_team_id').references(() => teams.id),
  awayTeamId: text('away_team_id').references(() => teams.id),
  kickoff: integer('kickoff', { mode: 'timestamp' }),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  status: text('status').notNull(), // scheduled | in_progress | final
  vegasSpread: real('vegas_spread'),
  vegasTotal: real('vegas_total'),
}, (t) => ({
  weekIdx: index('games_week_idx').on(t.season, t.week),
}));

// Hybrid: typed columns for the fields you always filter/sort/score on,
// a JSON blob for the long tail so new stat categories never need a migration.
export const playerGameStats = sqliteTable('player_game_stats', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().references(() => players.id),
  gameId: text('game_id').notNull().references(() => games.id),
  season: integer('season').notNull(),
  week: integer('week').notNull(),
  snapPct: real('snap_pct'),
  targets: integer('targets'),
  carries: integer('carries'),
  fantasyPtsStd: real('fantasy_pts_std'),
  fantasyPtsPpr: real('fantasy_pts_ppr'),
  rawStats: text('raw_stats', { mode: 'json' }).$type<Record<string, number>>(),
  source: text('source').notNull(),
  versionHash: text('version_hash').notNull(), // ties to Section 18/20
}, (t) => ({
  playerWeekIdx: uniqueIndex('pgs_player_week_idx').on(t.playerId, t.gameId),
}));

export const injuryReports = sqliteTable('injury_reports', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull().references(() => players.id),
  season: integer('season').notNull(),
  week: integer('week').notNull(),
  status: text('status').notNull(), // out | doubtful | questionable | probable
  practiceParticipation: text('practice_participation'),
  reportedAt: integer('reported_at', { mode: 'timestamp' }).notNull(),
});

export const oddsLines = sqliteTable('odds_lines', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull().references(() => games.id),
  playerId: text('player_id').references(() => players.id), // set for props, null for game lines
  marketType: text('market_type').notNull(), // spread | total | moneyline | anytime_td | rec_yards_ou
  line: real('line'),
  odds: integer('odds'),
  capturedAt: integer('captured_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  gameMarketIdx: index('odds_game_market_idx').on(t.gameId, t.marketType, t.capturedAt),
}));

// One row per resource key — the shared version/diff/ETag/cache-tag marker (Sections 18/19/20)
export const syncState = sqliteTable('sync_state', {
  resourceKey: text('resource_key').primaryKey(), // e.g. "player_game_stats:2026:4"
  versionHash: text('version_hash').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

College stats (`college_player_season_stats`) is worth keeping as a genuinely separate table rather than cramming into `players` or `playerGameStats` — different grain (season totals, not per-game), different source (CFBD), and mostly only relevant for a player's rookie year or two, so it doesn't belong in the hot weekly-stats path at all.

Migrations: run `drizzle-kit generate` against this schema as normal, then call the generated `migrate()` helper from each DO's constructor (or an explicit `/init` RPC call) before accepting queries on a freshly-created season shard — the Drizzle DO guide's pattern of gating queries behind a completed migration check is the right one to follow here.