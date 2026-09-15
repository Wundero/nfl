import { DurableObject } from "cloudflare:workers";

export class WebhookDO extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
}
