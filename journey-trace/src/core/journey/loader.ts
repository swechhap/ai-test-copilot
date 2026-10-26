/**
 * A "journey" is intentionally just a tagged Playwright test file — we do
 * NOT invent a new DSL (plain-English or otherwise). That was a deliberate
 * call: the indie-tooling research showed a land-rush of ~10 thin
 * "plain English -> Playwright" wrappers with no winner, versus
 * playwright-bdd's proof that reusing a format people already trust wins
 * big. Journeys here are real Playwright code; the only convention is a
 * `journey(id, fn)` wrapper (see templates/example.journey.ts) that lets
 * journey-trace discover and instrument them.
 */

export interface JourneyDefinition {
  id: string;
  filePath: string;
  description?: string;
}

/**
 * Discovers journey files under config.journeysDir (default: "./journeys")
 * by convention — any file matching *.journey.ts.
 *
 * TODO(phase-1): implement filesystem walk + static parse to extract the
 * journey id/description without executing the file (needed so `list` and
 * MCP's list_journeys tool work without spinning up a browser).
 */
export function discoverJourneys(journeysDir: string): JourneyDefinition[] {
  throw new Error("not implemented: discoverJourneys");
}
