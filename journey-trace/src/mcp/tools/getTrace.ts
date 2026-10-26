/**
 * MCP tool: get_trace — fetch raw trace content (golden or last-run) for a
 * journey, for when an agent needs more detail than the evidence bundle
 * provides (e.g. full aria-snapshot text to quote back to a human).
 */
export const getTraceTool = {
  name: "get_trace",
  description: "Fetch the raw golden or last-run trace YAML/JSON for one journey.",
  inputSchema: {
    type: "object",
    properties: {
      journeyId: { type: "string" },
      kind: { type: "string", enum: ["golden", "last_run"] }
    },
    required: ["journeyId", "kind"]
  } as const
};

export async function handleGetTrace(journeyId: string, kind: "golden" | "last_run"): Promise<string> {
  throw new Error("not implemented: handleGetTrace");
}
