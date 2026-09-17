import { DurableObject } from "cloudflare:workers";
import { createDb, type Database, migrate } from "@data-api/sharded-db";

export class DatabaseDO extends DurableObject {
  storage: DurableObjectStorage;
  db: Database;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.db = createDb(this);
    migrate(this.db);
  }
}
