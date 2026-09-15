import { createAuthClient } from "better-auth/react";

import { ENV } from "../env.public";

export const authClient = createAuthClient({
  baseURL: ENV.NEXT_PUBLIC_SERVER_URL,
});
