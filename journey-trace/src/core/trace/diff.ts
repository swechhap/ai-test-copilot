import type { GoldenTrace, JourneyTrace } from "./types.js";

export type DivergenceKind =
  | "step-added"
  | "step-removed"
  | "aria-snapshot-changed"
  | "network-call-added"
  | "network-call-removed"
  | "network-status-changed"
  | "network-shape-changed"
  | "console-error-introduced"
  | "final-path-changed";

export interface Divergence {
  kind: DivergenceKind;
  stepIndex?: number;
  /** Plain-text evidence a human (or an AI agent reading it via MCP) can act on without re-running anything. */
  evidence: string;
}

export interface TraceDiffResult {
  journeyId: string;
  /** True only when the two traces are structurally identical after normalization — never a fuzzy/confidence-based match. */
  identical: boolean;
  divergences: Divergence[];
}

/**
 * Pure, deterministic structural diff between a golden trace and a run
 * trace. No LLM call happens here, intentionally — this is the layer that
 * must stay 100% reproducible and free, so that AI only ever gets invoked
 * (downstream, via the MCP server) when there's something genuinely worth
 * reasoning about.
 *
 * TODO(phase-1): implement step-by-step structural comparison producing the
 * Divergence list above. Both traces MUST already be normalized
 * (see normalizeTrace) before being passed here.
 */
export function diffTraces(golden: GoldenTrace, run: JourneyTrace): TraceDiffResult {
  throw new Error("not implemented: diffTraces");
}
