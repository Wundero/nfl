import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createYoga } from "graphql-yoga";
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
  graphqlEndpoint: "/",
  plugins: [
    useResponseCache({
      session: () => null,
    }),
  ],
});

app.use("/api/graphql/v1/*", async (c) => {
  // TODO id like graphiql to be on a different endpoint
  // TODO SSE support?

  // @ts-expect-error Request type confusion, but this is valid
  return yoga.fetch(c.req.raw, c.env, c.executionCtx);
});

app.use("/api/data/v1/*", async (c) => {
  // TODO openapi from drizzle, readonly
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;

export { DatabaseDO } from "./dbdo";
export { WebhookDO } from "./whdo";
export { PullDataWorkflow } from "./wf";
