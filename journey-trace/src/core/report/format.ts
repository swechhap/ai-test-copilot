import type { EvidenceBundle } from "./evidence.js";

/**
 * Formats an EvidenceBundle as a PR-comment-ready Markdown block. Deliberately
 * plain language (per the UAT-readiness framing from product discussion) —
 * a non-technical reviewer should be able to read this without knowing what
 * an aria-snapshot is.
 *
 * TODO(phase-1): implement. Example target shape:
 *
 *   ### Journey: Approve Leave Request
 *   ⚠️ Behavior changed since last known-good run (2 divergences)
 *   - Step 3: a validation error that used to appear no longer appears
 *     (evidence: aria-snapshot diff attached)
 *   - Network: POST /api/leave/approve now returns 200 where it previously
 *     returned 400
 *
 *   Was this change intentional? If yes, run `journey-trace record
 *   approve-leave-request` to update the baseline.
 */
export function formatAsMarkdown(bundle: EvidenceBundle): string {
  throw new Error("not implemented: formatAsMarkdown");
}

export function formatAsJson(bundle: EvidenceBundle): string {
  return JSON.stringify(bundle, null, 2);
}
