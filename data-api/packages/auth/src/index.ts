import type { Database } from "@data-api/db";
import * as schema from "@data-api/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
};

export function createAuth(
  env: AuthConfig,
  database: Database,
  desktopOrigins: readonly string[] = [],
) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "sqlite",
      schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN, ...desktopOrigins],
    emailAndPassword: { enabled: true },
    // TODO disable email+password authn
    // TODO add oauth for: [google, facebook, github], maybe others?
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [
      /*
// TODO add plugins:
- Admin: https://better-auth.com/docs/plugins/admin
- Captcha: https://better-auth.com/docs/plugins/captcha
- i18n: https://better-auth.com/docs/plugins/i18n
- last login method: https://better-auth.com/docs/plugins/last-login-method
- openapi: https://better-auth.com/docs/plugins/open-api
- dbsc: https://www.npmjs.com/package/@dbsc-toolkit/better-auth
*/
    ],
  });
}
