import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { game } from "./games";
import { play } from "./play";

// flags bitfield, bits in order:
// 0 isNoHuddle, 1 isMotion, 2 isPlayAction, 3 isScreenPass, 4 isRunPassOption, 5 isTrickPlay,
// 6 isQbOutOfPocket, 7 isInterceptionWorthy, 8 isThrowAway, 9 isCatchableBall, 10 isContestedBall,
// 11 isCreatedReception, 12 isDrop, 13 isQbSneak, 14 isQbFaultSack
export const ftnCharting = sqliteTable(
  "ftn_charting",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id),
    playId: integer("play_id").references(() => play.id),
    flags: integer("flags").notNull(),
    startingHash: text("starting_hash"),
    quarterbackLocation: text("quarterback_location"),
    offenseBackfieldCount: integer("offense_backfield_count"),
    defenseBoxCount: integer("defense_box_count"),
    readThrown: text("read_thrown"),
    blitzerCount: integer("blitzer_count"),
    passRusherCount: integer("pass_rusher_count"),
    contentHash: text("content_hash"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("ftn_charting_game_idx").on(t.gameId),
    uniqueIndex("ftn_charting_play_idx").on(t.playId),
    index("ftn_charting_content_hash_idx").on(t.contentHash),
  ],
);
