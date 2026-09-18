import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { player } from "./reference";

export const contract = sqliteTable(
  "contract",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id").references(() => player.id),
    team: text("team"),
    isActive: integer("is_active", { mode: "boolean" }),
    yearSigned: integer("year_signed"),
    years: text("years"),
    value: real("value"),
    averagePerYear: real("average_per_year"),
    guaranteed: real("guaranteed"),
    averagePerYearCapPercentage: real("average_per_year_cap_percentage"),
    inflatedValue: real("inflated_value"),
    inflatedAveragePerYear: real("inflated_average_per_year"),
    inflatedGuaranteed: real("inflated_guaranteed"),
    seasonHistory: text("season_history"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("contract_player_idx").on(t.playerId),
    index("contract_year_idx").on(t.yearSigned),
    index("contract_content_hash_idx").on(t.contentHash),
  ],
);

export const contractHistory = sqliteTable(
  "contract_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    contractId: integer("contract_id")
      .notNull()
      .references(() => contract.id),
    team: text("team"),
    contractType: text("contract_type"),
    status: text("status"),
    yearSigned: integer("year_signed"),
    years: integer("years"),
    total: real("total"),
    averagePerYear: real("average_per_year"),
    guarantees: real("guarantees"),
    amountEarned: real("amount_earned"),
    percentEarned: real("percent_earned"),
    effectiveAveragePerYear: real("effective_average_per_year"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("contract_history_contract_idx").on(t.contractId),
    index("contract_history_content_hash_idx").on(t.contentHash),
  ],
);
