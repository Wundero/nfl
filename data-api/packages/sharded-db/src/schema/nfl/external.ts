import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const externalId = sqliteTable(
  "external_id",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id").notNull(),
    source: text("source").notNull(),
    value: text("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("external_id_lookup_idx").on(t.entityType, t.source, t.value),
    index("external_id_entity_idx").on(t.entityType, t.entityId),
  ],
);

export const syncState = sqliteTable(
  "sync_state",
  {
    resourceKey: text("resource_key").primaryKey(),
    sourceDigest: text("source_digest"),
    parserVersion: text("parser_version"),
    syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("sync_state_digest_idx").on(t.sourceDigest)],
);
