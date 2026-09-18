import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createYoga, renderGraphiQL } from "graphql-yoga";
import { schema } from "./gql";
import { env } from "./env.server";
import { createAuth } from "./services";
import { useResponseCache } from "@graphql-yoga/plugin-response-cache";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) => (await createAuth()).handler(c.req.raw));

const yoga = createYoga<Env & ExecutionContext>({
  schema,
  graphqlEndpoint: "/api/graphql",
  graphiql: false,
  plugins: [
    useResponseCache({
      session: () => null,
    }),
  ],
});

app.use("/api/graphql", async (c) => {
  // @ts-expect-error Request type confusion, but this is valid
  return yoga.fetch(c.req.raw, c.env, c.executionCtx);
});

app.get("/api/graphql/playground", async (c) => {
  return c.html(
    renderGraphiQL({
      endpoint: "/api/graphql/v1",
      title: "NFL Data API - GQL Playground",
    }),
  );
});

app.use("/api/data/v1/*", async (c) => {
  // TODO openapi from drizzle, readonly
  // TODO use Scalar, since betterauth uses that and i want to merge ba with this api schema
});

app.use("/api/webhook/v1/*", async (c) => {
  // TODO webhook management (get, create, update, delete)
  // TODO this should be authenticated with betterauth
});

// TODO do websocket (hibernation required) / SSE endpoints make sense for webhook alts to stream events to a client?

// TODO health check endpoint

app.get("/", (c) => {
  // TODO redirect to frontend
  return c.text("OK");
});

export default app;

export { DatabaseDO } from "./dbdo";
export { WebhookDO } from "./whdo";
export { PullDataWorkflow } from "./wf";
