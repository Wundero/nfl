import { DurableObject } from "cloudflare:workers";

export class WebhookDO extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  // TODO read from webhook_q, batch events together, send webhook requests with proper validation
}
