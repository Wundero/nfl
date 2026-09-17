import { drizzle } from "drizzle-orm/durable-sqlite";

import type { DatabaseConfig } from "./config";
import { relations } from "./schema";
export { getTableConfig } from "drizzle-orm/sqlite-core";

import { migrate as _migrate } from "drizzle-orm/durable-sqlite/migrator";
// @ts-expect-error Generated migrations do not generate types. It matches the expected types.
import migrations from "./migrations/migrations.js";

export function createDb(env: DatabaseConfig) {
  return drizzle(env.storage, { relations });
}

export function migrate(db: Database) {
  return _migrate(db, migrations);
}

export type Database = ReturnType<typeof createDb>;
export { relations };
