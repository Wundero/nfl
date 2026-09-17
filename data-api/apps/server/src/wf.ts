import { WorkflowEntrypoint } from "cloudflare:workers";

export type { WorkflowStep } from "cloudflare:workers";

export class PullDataWorkflow extends WorkflowEntrypoint {}
