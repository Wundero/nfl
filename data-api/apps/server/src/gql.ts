import SchemaBuilder from "@pothos/core";
import DrizzlePlugin from "@pothos/plugin-drizzle";
import { createDb, relations, getTableConfig } from "@data-api/sharded-db";
import RelayPlugin from "@pothos/plugin-relay";
import DataloaderPlugin from "@pothos/plugin-dataloader";
import WithInputPlugin from "@pothos/plugin-with-input";
import DirectivesPlugin from "@pothos/plugin-directives";

import { cacheControlDirective } from "@graphql-yoga/plugin-response-cache";

export interface PothosTypes {
  DrizzleRelations: typeof relations;
  Context: { season?: number } & Env & ExecutionContext;
  Directives: {
    cacheControl: {
      locations: "FIELD_DEFINITION" | "OBJECT";
      args: {
        scope: "PRIVATE" | "PUBLIC";
        maxAge: number;
      };
    };
  };
}

// Exists only to satisfy @pothos/plugin-drizzle's type signature — never
// actually queried. Every real fetch goes through a hand-written resolver
// calling the appropriate DO's RPC method.
const poisonStorage = new Proxy({} as DurableObjectStorage, {
  get() {
    throw new Error(
      "Type-only Drizzle client was invoked for a live query — write a " +
        "manual resolver against the shard RPC layer instead of using " +
        "t.relation/t.drizzleField on this builder.",
    );
  },
});

// TODO load schema from drizzle
// TODO dataloader should be shard-aware (e.g. player(id, season))

const builder = new SchemaBuilder<PothosTypes>({
  plugins: [DrizzlePlugin, DataloaderPlugin, RelayPlugin, WithInputPlugin, DirectivesPlugin],
  drizzle: {
    client: createDb({ storage: poisonStorage }),
    relations,
    getTableConfig,
  },
  relay: {
    nodesOnConnection: true,
  },
});

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      directives: [
        {
          name: "cacheControl",
          args: {
            scope: "PUBLIC",
            maxAge: 1000,
          },
        },
      ],
      resolve: () => "world",
    }),
  }),
});

export const schema = builder.toSchema();
