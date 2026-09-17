import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { player } from "./reference";

export const contract = sqliteTable(
  "contract",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playerId: integer("player_id").references(() => player.id),
    position: text("position"),
    team: text("team"),
    isActive: integer("is_active", { mode: "boolean" }).notNull(),
    yearSigned: integer("year_signed"),
    years: text("years").notNull(),
    value: real("value"),
    apy: real("apy"),
    guaranteed: real("guaranteed"),
    apyCapPct: real("apy_cap_pct"),
    inflatedValue: real("inflated_value"),
    inflatedApy: real("inflated_apy"),
    inflatedGuaranteed: real("inflated_guaranteed"),
    playerPage: text("player_page").notNull(),
    dateOfBirth: integer("date_of_birth", { mode: "timestamp_ms" }),
    height: text("height").notNull(),
    weight: text("weight").notNull(),
    college: text("college"),
    draftYear: text("draft_year").notNull(),
    draftRound: text("draft_round").notNull(),
    draftOverall: text("draft_overall").notNull(),
    draftTeam: text("draft_team"),
    seasonHistory: text("season_history").notNull(),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("contract_player_idx").on(t.playerId), index("contract_year_idx").on(t.yearSigned)],
);

export const contract_history = sqliteTable(
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
    yrs: integer("yrs"),
    total: real("total"),
    apy: real("apy"),
    guarantees: real("guarantees"),
    amountEarned: real("amount_earned"),
    percentEarned: real("percent_earned"),
    effectiveApy: real("effective_apy"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("contract_history_contract_idx").on(t.contractId)],
);
