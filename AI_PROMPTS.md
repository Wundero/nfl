# TODO fill out all prompts used from the claude convo here


# Prompts used when writing this project:

``` -> claude
I am playing fantasy football this season, and not doing so great, but i was curious about a potential ai league, where different ai/computer algorithms compete in a fantasy league. I was curious about setting up such a league to provide algos with the best chance, and i think data collection and wrangling is hard for me to wrap my head around. In my mind, the ideal setup is just as much data as possible - all game stats, player stats for all players active in the league including their college stats, coach stats, historic matchup stats, etc. - but im not really sure (a) where i would get the data, (b) what data is valuable, or (c) how i could use said data to make meaningful predictions if i were building my own statistical model of the game.

Some data points i thought could be meaningful:
- Current season schedule
- Player fantasy point numbers (the actual scoring metric) over their careers
- Injury reports
- Player head to heads
- Team head to heads, away and home differential
```

``` -> claude
I would like to see a good schema, though for a league id also like a "more data = more better" approach to allow each algo to determine what data it cares about. Some algos id like to try:
- Genuine models like xgboost/etc. that can make stat predictions
- LLMs which just get the data as json and make a decision using their internal logic/prompt logic
- Pure RNG
I also want to facilitate trading between algorithms as part of the league, and im not sure how best to make that work.
```

``` -> claude
Another thought ive had is making an "agentic" algo which gets the core data as its prompt, but also has access to tools which can pull other stats as desired. How could this work?

Im also ok with rngbot getting ruined in trades, though id like it to be something like rng() * trade_value_for_me > 0.5 or something, so it is more likely to accept good trades and less to accept bad ones (ideally as a scale from 0-1 for trade value)

Another question: when would it make sense to run this playground? I was thinking to run it a few times a week, given the infrequency of real world events, but im not sure that makes sense vs continuously running it and triggering each algo based on events (e.g. game-start, player-injured, trade-offered, game-starts-in-1h, etc.) - i want a decent amount of time to allow the llm agent to run, so i want to build some lenience into the event timings rather than game starts in 5 seconds, decide now on who is on your active roster.
```

``` -> claude
Last piece: i want this to be in typescript or rust as much as possible, and id like to build a visualization website in nextjs that will display stuff. The website need not be designed now, but i want to make sure any non-typescript behaviors can run in a way that typescript can iface with, such as with NAPI or an http api. I expect to run this mostly locally (save for llm apis), but am considering running on vercel/cloudflare if its an idea other people i know would be interested in, and in that case ill put non-ts items into docker containers.
```

``` -> claude
What apis exist for getting nfl and cfb data in typescript/rust?
```

``` -> claude
Could it be worth building a separate api for aggregating all the data, storing it in e.g. r2 or d1/dosqlite, and then serving that to my system / just publicly?

Also, what prior art exists for this project?
```

``` -> claude
For the licensing of the data, if i do a public api, itll likely be free, but i want to make sure the data is itself properly licensed and handled, so what would that look like?

For fantasy point scoring, i believe different websites (espn, nfl.com, yahoo sports) have slightly different scoring algorithms to determine a player's points - are they public for people to use and/or are there inferred algorithm impls? Id like to make the scoring system a config option when making a league, so if i can make a system able to score based on all major fantasy league systems thatd be ideal
```

``` -> claude
If i were to make my aggregator open source, would that be allowed, what licensing could i use (ideally mit), and are there other sources of college data that are able to be licensed this way? I really would like to make the data public and free where possible.
```

``` -> claude
For the aggregator, whats the best way to automatically pull relevant data? Is it just a cron job (or cf workflow) which polls the nflverse/etc. data sources daily?
```

``` -> claude
I am gonna commit to making the data aggregation+api separate, so this api should be able to ignore the league concept entirely and just track the raw data, and i can figure out d1/do topology separately. One feature which might be cook is webhooks, especially given the delta/diff functionality expected to be present - which could also drive the fantasy league sim event setup, albeit likely filtered+debounced - if i want to make the public api scalable and reasonably cheap, how can i implement a good webhook solution on cloudflare that properly fans out, keeps request counts low-ish, handles proper authn, etc.? I plan to gate webhooks behind auth(n+z) and limit per-account webhooks, but thats likely kind of weak so i want to make sure even large wh counts are reasonably inexpensive
```

``` -> claude
Another piece of the public daya api puzzle im curious about is caching - i believe i can cache most data using standard cache control headers when responding from a worker, but how best can i design that setup for the type of data this api has?  And is there a mechanism caching can support to improve my webhook costs?
```

``` -> claude
Is there a way to configure cache rules via wrangler, should i look at cloudflare.config.ts (or whatever its called), iac tools like alchemy/sst/pulumi, or just manually configure in the dashboard? I want to minimize worker hits using the cache to keep the api cheap and fast
```

``` -> claude
Ive seen cloudflare.config.ts (or something like that) recently in cf blogs and stuff, but cant find docs on it - what is it and where can i find up to date info on it?
```

``` -> claude
I am going to use drizzle and durable-object sqlite for my sharded database (d1 sharding is nontrivial for workers), what should my schema look like (roughly) for the data?
```

``` -> claude
I want to use workflows + hyparquet to process parquet data into db updates, and my goal is this flow:

1. Take download stream from github
2. Pipe through hyparquet to convert to a stream of *row* chunks (ndjson)
3. For each chunk, process the data and update the row in dosql if needed


How would I do this, and does this even make sense to do given parquet's columnar approach vs this row-oriented approach? I have to be able to process parquet because not all csv data from nflverse is up to date, but all parquet data is.
```

``` -> claude
I am storing the downloaded files in R2 - aiming to be an effective mirror of the github releases, more or less - so how would I apply the range query setup against R2 since it doesn't directly use HTTP (im using the workers binding)?
```

``` -> claude
given that i want to run this in a cloudflare workflow, would it make sense to just load the whole file into memory (all the files are likely to be <= 100mb each, even uncompressed), then process the whole thing using hyparquet / csv reading to produce the diff? I already have to request the whole file anyways to store it into R2, so it might make sense to tee the response, load the whole thing in one step, and update the sqlite db based on the relevant data.
```

``` -> claude
I am wanting to use a lot more of the nflverse (and probably the other sources too) in my data and in my database, and I was wondering if it would make sense to build 2 APIs:

1. The first API would be a standard HTTP RESTful API, with OpenAPI specs, and a standard openapi/swagger schema + playground
2. The second API would be a readonly (so doesn't control webhooks, namely) GraphQL API, which allows users to fetch the data they care about


My questions:

* Does graphql even make sense?
* How best should the graphql server be implemented? Specifically, what typescript libraries should I use to plug my API with, specifically for hono+cloudflare workers where possible
* How does caching integrate with graphql? I very much want to cache aggressively for it, but I am unsure what that would look like.
* How would graphql work wrt the sharded db architecture (season sharding, with one shard that groups data which has no season) and how can I "federate" the setup properly through relevant sharded dos?
```

``` -> claude
the drizzle plugin requires a single database client for drizzle for it to work, but that doesn't really make sense in my case (I think) given the sharding behaviors.

This is my current builder:

`ts
const builder = new SchemaBuilder<PothosTypes>({
  plugins: [DrizzlePlugin, DataloaderPlugin, RelayPlugin, WithInputPlugin, DirectivesPlugin],
  drizzle: {
    client: (c) =>{
      const doStub = c.DATABASE_DO.getByName(`data-${c.season ?? "all"}`);
      return createDb(null as any);
    },
    relations,
    getTableConfig,
  },
  relay: {
    nodesOnConnection: true,
  },
})
`

`createDb` expects `DurableObjectStorage` as a param (in a DO's context, passing `this` works as intended), since thats what the drizzle client expects, but it doesn't make sense from outside the context of a DO to refer to its storage. 

Ideally, all of my types from my schema get autogenerated into pothos types, with appropriate data loading and relay pagination, but im not quite sure how to  do that.
```


``` -> opencode
Based on the data that nflverse's github releases provide (I will collect them separately), I have devised zod schemas which can more or less process the input data into structured (ish) types. For each type, write a good description into a describe() call for each field, using existing ones as references (except when they are //todos, in which case please replace those; also, the stats_player and stats_team schemas have outdated descriptions that need updating). Once done, setup the exported NFLVERSE_TAG_SCHEMA (refer to the RELEASE_MAP for the keys of this object, and different array values should likely be mapped to different object values in this tag schema object) with all of the schemas. If you need data references, the ignored `data-pull` folder contains the parquet files, an `enums.json` file per tag which dedupes all values for each key, and a `.schema.json` file per tag+grouped type which has a very rudimentary schema (parquet type + enums in some cases), but ideally you can do your work without that, since those are large files which aren't trivial to parse manually.

Lastly, individual schemas should not be exported from this file, just the one object.
```

``` -> opencode
A few schemas for the data under any given tag (e.g. qbr_season_level + qbr_week_level) can share properties with the exact same parsing logic - determine which schemas share keys and extract those. Do not extract schemas across different tags, as the validation logic may be different, and likely too is the semantic meaning.
```

``` -> opencode
I used some pretty gross names for the shared schema utility types (e.g. boolZ1 = boolean from strings (stringbool from zod, true,false,t,f,...) + 0 or 1), with not much consistency. Please rename those shared schema helpers.

I also feel using coerce everywhere is a bit gross. I can effectively guarantee `parquet` is the valid source of data, which will produce either strings or numbers (in my use case anyways), so the vast majority of properties need not be coerced. There are special cases though, such as the boolean cases and some places where the schema says float but I put string because I think it makes more sense (e.g. jersey number, most of them are floats but there are a couple with letters in one dataset so I'd rather keep strings). Based on the schema.json files and the current schemas, minimize the number of coercions that happen since they are not super necessary. Note that the helpers also do a bunch of coercion which may not be necessary, and in those cases the helper types might not even be needed if the non-coercive path is already well supported by zod.
```

``` -> opencode
Please fix the names to match what the data has, since I likely typo'd them.
```

``` -> opencode
For the remaining failures:
1. Depth chart year split makes sense to me
2. Ideally the date columns become js dates, with parsing that is tolerant of the column's particular input values. It would be nice to include the dates which I did not parse myself too (e.g. the M/D/YY style dates) into js dates. Assume timezone is EST (America/New_York) unless stated otherwise
3. I wasn't sure what `loaded` was across pfr_advstats, but I suspect it's not really needed for my data, so it can be removed.
4. The enums for positions come from the data, but im very tempted to just make them strings (effectively just low cardinality strings) since they don't seem consistent. For the FTN 0 sentinel, I think it could be just converted to null (since it seems unknown).
5. Please add `timeouts`, `gsis_id`, `contract_history`, and `season_type` columns. In general, it would be good to not care about `date_modified` data for any tags because we check the sha digest anyways, so its useless to us.
```

``` -> opencode
I want to normalize the data that I parse from nflverse into a relational schema for storage in sqlite (durable objects), sharded by season.

A few requirements I have:
- The IDs used for a given entity should just be autoinc ints (ideally 64 bit)
- Ideally, links between rows can be determined at parse time using e.g. team abbrs, but at query time (via the API) joins happen using the ids
- The IDs assigned to a given entity by other parties, including nflverse's ids, should be collected in a separate table, to keep things clean
  - Query lookup by so-called external IDs will likely require 2 steps (find row in extid table, then find row for given entity), but thats acceptable for me I think. I expect most queries to use names and/or abbreviations, not external IDs.
- I think entities should be assigned slugs as well, mostly just `kebab-case`'ing their names (e.g. `Arizona Cardinals` -> `arizona-cardinals`), for easy lookup as a secondary form of id
  - For collisions (e.g. `Josh Allen` has 2 players with that name, at least in some seasons), it would be helpful to put info about that entity (e.g. jersey number, position) in the slug, and if that fails to be unique, add an incrementing number that starts at 2 on the end.
- I want to be able to "diff" a given entity from the current db state to whatever gets parsed by the parsing logic, so a mechanism to track that (e.g. sync state, though im not sure how best to handle this) in the data itself is needed. This only applies to mutable state though, and a lot of stuff (e.g. historical data, some basic player info, etc.) will never change, so the diffing logic should ideally be a bit simpler there.

Based on the schemas in the data package and the above requirements, replace the schema in `sharded-db/src/schema/nfl.ts` with an appropriate drizzle schema. Use `drizzle-orm@rc`'s new v2 relations style (docs: https://orm.drizzle.team/docs/sqlite/relations-v1-v2, https://orm.drizzle.team/docs/sqlite/v0-v1-changes), as that version is necessary to support graphql for the query layer (which is coming later).
```

``` -> opencode
Why are play's player refs denormalized? I feel like the number of cols (3: name, id, sometimes team) is higher than needed, and it would be nice to normalize that. Also, there are a number of columns on play that are redundant with other stats tables, that can definitely be removed. I would prefer normalizing as much as possible for this API, since I think it makes the external APIs easier to digest.
```

``` -> opencode
The nfl.ts file and schema.ts file are both quite large - it would be great to split out the code into proper files in a subfolder with an index file containing the main export that would be used.
```

``` -> opencode
I want to make sure my server API exposes a graphql endpoint AND a separate graphiql (or other gql playground) page, for exploring the schema. How can I make that happen with graphql yoga and hono? I have some setup in the index.ts of the apps/server pkg, but I am not sure the setup works for graphiql, or if it would be best to have a separate package that handles graphiql.
```

``` -> opencode
As a general question, how best should I handle api versioning for graphql? I feel as though it should be a bit different to how RESTful apis handle versioning, and I want to make a proper decision on how I should version APIs before I launch the app.
```
