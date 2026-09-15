# TODO fill out all prompts used from the claude convo here


# Prompts used when writing this project:

```
I am playing fantasy football this season, and not doing so great, but i was curious about a potential ai league, where different ai/computer algorithms compete in a fantasy league. I was curious about setting up such a league to provide algos with the best chance, and i think data collection and wrangling is hard for me to wrap my head around. In my mind, the ideal setup is just as much data as possible - all game stats, player stats for all players active in the league including their college stats, coach stats, historic matchup stats, etc. - but im not really sure (a) where i would get the data, (b) what data is valuable, or (c) how i could use said data to make meaningful predictions if i were building my own statistical model of the game.

Some data points i thought could be meaningful:
- Current season schedule
- Player fantasy point numbers (the actual scoring metric) over their careers
- Injury reports
- Player head to heads
- Team head to heads, away and home differential
```

```
I would like to see a good schema, though for a league id also like a "more data = more better" approach to allow each algo to determine what data it cares about. Some algos id like to try:
- Genuine models like xgboost/etc. that can make stat predictions
- LLMs which just get the data as json and make a decision using their internal logic/prompt logic
- Pure RNG
I also want to facilitate trading between algorithms as part of the league, and im not sure how best to make that work.
```

```
Another thought ive had is making an "agentic" algo which gets the core data as its prompt, but also has access to tools which can pull other stats as desired. How could this work?

Im also ok with rngbot getting ruined in trades, though id like it to be something like rng() * trade_value_for_me > 0.5 or something, so it is more likely to accept good trades and less to accept bad ones (ideally as a scale from 0-1 for trade value)

Another question: when would it make sense to run this playground? I was thinking to run it a few times a week, given the infrequency of real world events, but im not sure that makes sense vs continuously running it and triggering each algo based on events (e.g. game-start, player-injured, trade-offered, game-starts-in-1h, etc.) - i want a decent amount of time to allow the llm agent to run, so i want to build some lenience into the event timings rather than game starts in 5 seconds, decide now on who is on your active roster.
```

```
Last piece: i want this to be in typescript or rust as much as possible, and id like to build a visualization website in nextjs that will display stuff. The website need not be designed now, but i want to make sure any non-typescript behaviors can run in a way that typescript can iface with, such as with NAPI or an http api. I expect to run this mostly locally (save for llm apis), but am considering running on vercel/cloudflare if its an idea other people i know would be interested in, and in that case ill put non-ts items into docker containers.
```

```
What apis exist for getting nfl and cfb data in typescript/rust?
```

```
Could it be worth building a separate api for aggregating all the data, storing it in e.g. r2 or d1/dosqlite, and then serving that to my system / just publicly?

Also, what prior art exists for this project?
```

```
For the licensing of the data, if i do a public api, itll likely be free, but i want to make sure the data is itself properly licensed and handled, so what would that look like?

For fantasy point scoring, i believe different websites (espn, nfl.com, yahoo sports) have slightly different scoring algorithms to determine a player's points - are they public for people to use and/or are there inferred algorithm impls? Id like to make the scoring system a config option when making a league, so if i can make a system able to score based on all major fantasy league systems thatd be ideal
```

```
If i were to make my aggregator open source, would that be allowed, what licensing could i use (ideally mit), and are there other sources of college data that are able to be licensed this way? I really would like to make the data public and free where possible.
```

```
For the aggregator, whats the best way to automatically pull relevant data? Is it just a cron job (or cf workflow) which polls the nflverse/etc. data sources daily?
```

```
I am gonna commit to making the data aggregation+api separate, so this api should be able to ignore the league concept entirely and just track the raw data, and i can figure out d1/do topology separately. One feature which might be cook is webhooks, especially given the delta/diff functionality expected to be present - which could also drive the fantasy league sim event setup, albeit likely filtered+debounced - if i want to make the public api scalable and reasonably cheap, how can i implement a good webhook solution on cloudflare that properly fans out, keeps request counts low-ish, handles proper authn, etc.? I plan to gate webhooks behind auth(n+z) and limit per-account webhooks, but thats likely kind of weak so i want to make sure even large wh counts are reasonably inexpensive
```

```
Another piece of the public daya api puzzle im curious about is caching - i believe i can cache most data using standard cache control headers when responding from a worker, but how best can i design that setup for the type of data this api has?  And is there a mechanism caching can support to improve my webhook costs?
```

```
Is there a way to configure cache rules via wrangler, should i look at cloudflare.config.ts (or whatever its called), iac tools like alchemy/sst/pulumi, or just manually configure in the dashboard? I want to minimize worker hits using the cache to keep the api cheap and fast
```

```
Ive seen cloudflare.config.ts (or something like that) recently in cf blogs and stuff, but cant find docs on it - what is it and where can i find up to date info on it?
```

```
I am going to use drizzle and durable-object sqlite for my sharded database (d1 sharding is nontrivial for workers), what should my schema look like (roughly) for the data?
```