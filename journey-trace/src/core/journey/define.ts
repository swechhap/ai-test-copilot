import type { Page } from "@playwright/test";

export interface JourneyContext {
  page: Page;
}

export type JourneyFn = (ctx: JourneyContext) => Promise<void>;

/**
 * The only API a consumer learns. Wraps a plain Playwright script so
 * journey-trace can discover it (by static id, without executing it — see
 * core/journey/loader.ts) and instrument its `page` with a TraceRecorder
 * when actually run via `journey-trace run` / `record`.
 *
 * Calling journey() directly (e.g. via `node some.journey.ts`) is a no-op
 * registration only — execution always goes through runJourney().
 *
 * TODO(phase-1): implement a module-level registry so loader.ts and
 * runner.ts can both resolve a journeyId back to its JourneyFn.
 */
export function journey(id: string, fn: JourneyFn): void {
  throw new Error("not implemented: journey() registration");
}
