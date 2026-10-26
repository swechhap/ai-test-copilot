import type { JourneyTrace } from "../trace/types.js";
import type { JourneyDefinition } from "./loader.js";

export interface RunOptions {
  baseUrl: string;
  journey: JourneyDefinition;
}

/**
 * Launches a browser (via @playwright/test's own runner primitives — we do
 * not reimplement browser lifecycle management), executes the journey file
 * against `baseUrl`, and returns the resulting JourneyTrace via
 * TraceRecorder. No diffing, no AI, no file I/O happens here — this
 * function's only job is "run the journey, hand back what happened."
 *
 * TODO(phase-1): implement using Playwright's programmatic API
 * (chromium.launch() / newContext() / newPage()), wiring a TraceRecorder
 * to the page for the duration of the run.
 */
export async function runJourney(options: RunOptions): Promise<JourneyTrace> {
  throw new Error("not implemented: runJourney");
}
