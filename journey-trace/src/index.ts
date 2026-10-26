// Public library API — for consumers who want to call journey-trace
// programmatically instead of via the CLI (e.g. a custom CI integration).
export { journey } from "./core/journey/define.js";
export type { JourneyContext, JourneyFn } from "./core/journey/define.js";
export type {
  JourneyTrace,
  GoldenTrace,
  RunTrace,
  JourneyStepTrace,
  NetworkEntrySummary,
  JourneyTraceConfig,
  NormalizeRule
} from "./core/trace/types.js";
export { diffTraces } from "./core/trace/diff.js";
export type { TraceDiffResult, Divergence, DivergenceKind } from "./core/trace/diff.js";
export { buildEvidenceBundle } from "./core/report/evidence.js";
export type { EvidenceBundle } from "./core/report/evidence.js";
export { runJourney } from "./core/journey/runner.js";
export { discoverJourneys } from "./core/journey/loader.js";
export type { JourneyDefinition } from "./core/journey/loader.js";
