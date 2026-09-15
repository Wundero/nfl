import { createAuth as createConfiguredAuth } from "@data-api/auth";
import { type Database, createDb } from "@data-api/db";

import { env } from "./env.server";

export function getDb(): Database {
  return createDb(env);
}
export async function createAuth(database?: Database) {
  return createConfiguredAuth(env, database ?? getDb());
}
