/**
 * Core trace types. A "trace" is a deterministic, git-diffable record of one
 * run of one journey: its step sequence, the accessibility-tree state after
 * each step, and a redacted summary of network activity. It intentionally
 * does NOT include pixels, raw timestamps, or raw response bodies — those
 * are either out of scope (pixels: handled natively by Playwright's own
 * toHaveScreenshot, not duplicated here) or normalized away so that two
 * traces of an unchanged journey are byte-identical and diffs are only ever
 * caused by a real behavior change.
 */

export interface NetworkEntrySummary {
  method: string;
  /** Path only — host/query params that vary per-environment are stripped by config.normalize rules. */
  path: string;
  status: number;
  /** Shape, not content: e.g. { "id": "string", "items": "array(3)" } — never raw PII/payloads by default. */
  requestBodyShape?: Record<string, string>;
  responseBodyShape?: Record<string, string>;
}

export interface JourneyStepTrace {
  index: number;
  /** Human-readable action name, e.g. "click", "fill", "goto" — mirrors the Playwright call made in the journey spec. */
  action: string;
  /** Selector/role description used, for evidence purposes (not re-used for replay — replay re-runs the real journey code). */
  target: string;
  /** Output of page.locator(...).ariaSnapshot() (or page-level) immediately after this step settles. */
  ariaSnapshot: string;
  network: NetworkEntrySummary[];
  consoleErrors: string[];
}

export interface JourneyTrace {
  /** Trace schema version — bump on breaking format changes so old golden files fail loudly, not silently. */
  version: 1;
  journeyId: string;
  /** Normalized base URL path only (e.g. "/auth/login") — the actual host is a run-time parameter, never baked into the golden file. */
  entryPath: string;
  steps: JourneyStepTrace[];
  finalState: {
    ariaSnapshot: string;
    path: string;
  };
}

/** A golden trace is a JourneyTrace with no run-specific metadata — this is what gets committed to git. */
export type GoldenTrace = JourneyTrace;

/** A run trace additionally carries the metadata needed to explain *when/where* a comparison happened — never committed, only produced per-CI-run. */
export interface RunTrace extends JourneyTrace {
  runId: string;
  capturedAt: string; // ISO timestamp — evidence metadata only, excluded from the diffed/hashed trace body.
  baseUrl: string;
}

export interface NormalizeRule {
  /** Regex applied to ariaSnapshot text, path strings, and body-shape keys before diffing/hashing. */
  pattern: string;
  replacement: string;
  description?: string;
}

export interface JourneyTraceConfig {
  journeysDir: string;
  goldenDir: string;
  normalize: NormalizeRule[];
}
