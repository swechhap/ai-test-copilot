import type { Page } from "@playwright/test";
import type { JourneyStepTrace, JourneyTrace, NetworkEntrySummary } from "./types.js";

/**
 * Attaches to a Playwright Page for the duration of one journey run and
 * incrementally builds a JourneyTrace: an aria-snapshot + network summary
 * after every step, plus any console errors observed in between steps.
 *
 * Design intent (for whoever implements this next):
 * - Use `page.on("console")` + `page.on("response")` to passively collect
 *   evidence — never re-navigate or re-run anything just to capture it.
 * - Network bodies are summarized to a *shape* (see NetworkEntrySummary),
 *   never stored raw, both for diff stability and to avoid leaking
 *   sensitive UAT data into a committed golden file.
 * - This class has no opinion on *whether* a trace should become golden —
 *   that decision is explicit, human-triggered, and lives in the `record`
 *   CLI command, never here.
 */
export class TraceRecorder {
  private steps: JourneyStepTrace[] = [];
  private pendingNetwork: NetworkEntrySummary[] = [];
  private pendingConsoleErrors: string[] = [];

  constructor(private readonly page: Page, private readonly journeyId: string) {
    // TODO(phase-1): wire page.on("console") / page.on("response") listeners
    // into this.pendingNetwork / this.pendingConsoleErrors.
  }

  /** Call after every meaningful journey step (click, fill, goto, assert). */
  async captureStep(action: string, target: string): Promise<void> {
    throw new Error("not implemented: TraceRecorder.captureStep");
  }

  /** Call once at the end of the journey to produce the final JourneyTrace. */
  async finish(): Promise<JourneyTrace> {
    throw new Error("not implemented: TraceRecorder.finish");
  }
}
