import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";


export const webhook = sqliteTable("webhook", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()), // TODO uuidv7
  // As a note, the ID of the webhook is likely to be the same as the durable object's name, so that it can be trivially
  //  loaded when sending events.
  ownerId: text("owner_id").notNull().references(() => user.id),

  destinationUrl: text("destination_url").notNull(),
  // TODO type this better. goal: this should repr the set of events this wh is subscribed to
  event_config: text("event_config", {mode: "json"}).$type<Record<string, boolean>>().notNull(),
  // TODO: add authn stuff (keys, hmac, etc.)
  // TODO: add verification stuff (response checks, etc.)
  // TODO rate limit cfgs

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// TODO webhook send status table? might get really large, could be worth adding to a different place than sqlite

// Claude notes:
/*
Pipeline: your diff step (Section 18) publishes to a raw-events Queue → a fanout-matcher consumer looks up matching 
 subscriptions via a KV-cached topic index (not a D1 scan per event) → each match gets routed to a per-subscription 
 Durable Object that buffers events and flushes on a debounce alarm → the flush produces one signed, batched payload 
 onto a webhook-deliveries Queue → a delivery worker POSTs it, with Cloudflare's native retry/DLQ handling failures 
 and auto-pausing dead endpoints after repeated failures.

The DO-per-subscription buffer is the load-bearing piece: a burst of 40 injury-report updates becomes one webhook call
 per subscriber, not 40, and it's a well-worn Cloudflare idiom (alarm-based coalescing) rather than something you're
 hand-rolling.

Keeping counts down: subscriber-configurable debounce window (realtime micro-debounce vs. batched-every-N-minutes — 
 most consumers, including your own sim, only need delivery within their own decision-window tolerance anyway), 
 mandatory topic scoping at subscription time (no unscoped firehoses), and the fact that Workers bill active CPU time 
 rather than wall-clock — so a slow-but-alive subscriber costs you little even while you wait on their response.

Authn/authz: bearer API keys with scopes for the control plane (who can subscribe to what granularity), HMAC-signed 
 deliveries with timestamp-based replay protection for authenticity, and — easy to miss — an ownership-verification 
 handshake plus private-IP-range rejection on registered URLs, checked both at creation and delivery time, since DNS 
 can be re-pointed after the initial check. The real backstop you're missing beyond subscription-count limits is a 
 per-account token-bucket cap on aggregate delivery attempts per minute, independent of how many subscriptions they 
 hold — that's what actually bounds worst-case cost, since one hot topic could fan out huge volume through very 
 few subscriptions.
*/