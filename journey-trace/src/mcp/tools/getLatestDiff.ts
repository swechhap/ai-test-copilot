import type { EvidenceBundle } from "../../core/report/evidence.js";

/**
 * MCP tool: get_latest_run_diff — the primary tool an AI agent calls to do
 * root-cause reasoning. Returns the curated EvidenceBundle for the most
 * recent `journey-trace run` of the given journey, never the raw trace
 * dump (keeps the agent's context window small and focused).
 */
export const getLatestDiffTool = {
  name: "get_latest_run_diff",
  description:
    "Get the structural diff (evidence bundle) between the last CI run and the committed golden trace for one journey. Use this to reason about whether a change is a regression, locator drift, or expected behavior change — journey-trace deliberately provides no verdict itself.",
  inputSchema: {
    type: "object",
    properties: {
      journeyId: { type: "string" }
    },
    required: ["journeyId"]
  } as const
};

export async function handleGetLatestDiff(journeyId: string): Promise<EvidenceBundle> {
  throw new Error("not implemented: handleGetLatestDiff");
}
