import { WorkflowEntrypoint, WorkflowStep, type WorkflowEvent } from "cloudflare:workers";
// TODO better export from data (ideally /data/nflverse)
import { pullLatestNFLVerse } from "@data-api/data/src/nflverse/index";
export type { WorkflowStep, WorkflowEvent } from "cloudflare:workers";

export class PullDataWorkflow extends WorkflowEntrypoint<Env> {
  async run<T>(_event: Readonly<WorkflowEvent<T>>, step: WorkflowStep) {
    await Promise.all([
      pullLatestNFLVerse(
        step,
        this.env.KV,
        this.env.BUCKET,
        this.env.WEBHOOK_Q,
        this.env.DATABASE_DO,
      ),
      // TODO other data sources
    ]);
  }
}
