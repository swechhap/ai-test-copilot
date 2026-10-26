/**
 * journey-trace's MCP server. Exposes four tools over stdio to any
 * MCP-compatible client. Three are read-only; exactly one (`approve_baseline`)
 * writes to disk, and it mirrors the CLI's `record` command's intent
 * exactly — it must always correspond to an explicit human action in
 * whatever client calls it (Claude Desktop, Cursor, VS Code Copilot, a CI
 * bot acting on a human's behalf), never an autonomous decision taken
 * because the model "felt confident." journey-trace has no confidence
 * score to offer in the first place — see diff.ts: divergences are
 * boolean/structural, not probabilistic.
 *
 * Tools:
 *   list_journeys          -> JourneyDefinition[]
 *   get_latest_run_diff     -> EvidenceBundle for a given journeyId
 *   get_trace               -> raw golden or last-run trace content, for
 *                              when an agent needs more context than the
 *                              evidence bundle provides
 *   approve_baseline        -> promotes the last run trace to golden
 *                              (same effect as `journey-trace record`)
 *
 * TODO(phase-1): implement using @modelcontextprotocol/sdk's Server class
 * with a stdio transport, registering the four tool handlers below.
 */
export async function startMcpServer(): Promise<void> {
  throw new Error("not implemented: startMcpServer");
}
