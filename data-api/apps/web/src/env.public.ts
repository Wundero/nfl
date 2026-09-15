// Alchemy validates deployment inputs with Varlock; Workers use native env bindings.
import type { PublicCoercedEnvSchema } from "./env";

export const ENV = {
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL!,
} satisfies Pick<PublicCoercedEnvSchema, "NEXT_PUBLIC_SERVER_URL">;
