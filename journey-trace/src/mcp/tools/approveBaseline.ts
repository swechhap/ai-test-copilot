/**
 * MCP tool: approve_baseline — THE ONLY write tool in this server. Promotes
 * the last run trace to the new golden baseline for a journey, identical
 * in effect to running `journey-trace record` by hand.
 *
 * This must only ever be invoked as the direct result of an explicit human
 * instruction surfaced through the calling client (e.g. a developer telling
 * Claude/Copilot "yes, that change was intentional, update the baseline").
 * journey-trace itself enforces no such gate technically — that
 * responsibility belongs to the MCP client's own tool-approval UX — but
 * this tool's description is written to make the expectation explicit to
 * any model reading it.
 */
export const approveBaselineTool = {
  name: "approve_baseline",
  description:
    "Promote the last CI run's trace to the new committed golden baseline for a journey. Only call this after a human has explicitly confirmed the behavior change shown in get_latest_run_diff was intentional. This writes a file that will appear as a diff in the next commit/PR.",
  inputSchema: {
    type: "object",
    properties: {
      journeyId: { type: "string" }
    },
    required: ["journeyId"]
  } as const
};

export async function handleApproveBaseline(journeyId: string): Promise<{ written: string }> {
  throw new Error("not implemented: handleApproveBaseline");
}
