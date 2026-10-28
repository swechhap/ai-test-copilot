import type { TraceDiffResult } from "../trace/diff.js";

/**
 * An EvidenceBundle is the ONLY thing journey-trace ever hands to an AI
 * consumer (via the MCP server) or to a human (via a PR comment). It is a
 * filtered, already-structured summary — never the raw trace dump — both
 * to keep LLM context usage bounded (the exact problem
 * hubertgajewski/playwright-report-mcp exists to solve) and so the AI is
 * reasoning over curated evidence rather than guessing from noise.
 *
 * journey-trace never includes a verdict here — no "this is probably a
 * regression" field. That classification is explicitly left to whichever
 * AI agent/human consumes this bundle. journey-trace's job stops at
 * producing trustworthy evidence.
 */
export interface EvidenceBundle {
  journeyId: string;
  identical: boolean;
  divergenceCount: number;
  divergences: TraceDiffResult["divergences"];
  goldenTraceRef: string; // path to the committed golden file, so a consumer can read full context if needed
  runTraceRef: string; // path to the ephemeral run trace for this CI run
}

/**
 * TODO(phase-1): implement — straightforward projection from a
 * TraceDiffResult plus file paths into the bundle shape above.
 */
export function buildEvidenceBundle(
  diff: TraceDiffResult,
  goldenTraceRef: string,
  runTraceRef: string
): EvidenceBundle {
  throw new Error("not implemented: buildEvidenceBundle");
}
