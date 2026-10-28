import type { JourneyDefinition } from "../../core/journey/loader.js";

/** MCP tool: list_journeys — no input, returns every configured journey. */
export const listJourneysTool = {
  name: "list_journeys",
  description:
    "List all journeys configured in this repo (id + description). Use this first to discover what's available before calling get_latest_run_diff.",
  inputSchema: { type: "object", properties: {} } as const
};

export async function handleListJourneys(): Promise<JourneyDefinition[]> {
  throw new Error("not implemented: handleListJourneys");
}
