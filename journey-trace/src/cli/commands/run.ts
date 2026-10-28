/**
 * `journey-trace run --base-url <url> [--journey <id>]`
 *
 * The command CI calls on every build promoted to the UAT/pre-prod
 * environment (per the product's trigger model — NOT pre-merge). For each
 * configured journey (or just the one named):
 *   1. runJourney() against baseUrl -> RunTrace
 *   2. normalizeTrace() on both the run trace and the loaded golden trace
 *   3. diffTraces() -> TraceDiffResult
 *   4. buildEvidenceBundle() -> written to ./.journey-trace/runs/<journeyId>.json
 *      (gitignored — ephemeral per-CI-run evidence, not committed)
 *   5. print formatAsMarkdown() to stdout for a PR-comment step to pick up
 *
 * Exit code is non-zero if any journey has divergences, so this can gate a
 * CI job — but note it NEVER classifies the divergence as "bad," it only
 * reports that behavior changed. Whether that's acceptable is a human (or
 * downstream AI-agent-via-MCP) decision.
 *
 * TODO(phase-1): implement orchestration described above.
 */
export interface RunCommandOptions {
  baseUrl: string;
  journeyId?: string;
}

export async function runCommand(options: RunCommandOptions): Promise<void> {
  throw new Error("not implemented: runCommand");
}
