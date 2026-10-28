/**
 * `journey-trace record <journeyId> --base-url <url>`
 *
 * The ONLY command that writes to ./.journey-trace/golden/. This is always
 * a human-triggered, explicit action — never invoked automatically by
 * `run` or by CI. Running it overwrites that journey's golden trace file,
 * which then shows up as a normal, human-reviewable diff in the next PR —
 * this IS the audit trail (git history), not a separate feature to build.
 *
 * TODO(phase-1): implement — runJourney() against baseUrl, normalizeTrace(),
 * serializeGoldenTrace(), write to <goldenDir>/<journeyId>.yaml.
 */
export interface RecordOptions {
  journeyId: string;
  baseUrl: string;
}

export async function recordCommand(options: RecordOptions): Promise<void> {
  throw new Error("not implemented: recordCommand");
}
