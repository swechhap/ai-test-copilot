import type { JourneyTraceConfig } from "../core/trace/types.js";

export const DEFAULT_CONFIG: JourneyTraceConfig = {
  journeysDir: "./journeys",
  goldenDir: "./.journey-trace/golden",
  normalize: [
    { pattern: "\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b", replacement: "<uuid>", description: "UUIDs" },
    { pattern: "\\b\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z?\\b", replacement: "<timestamp>", description: "ISO timestamps" }
  ]
};

/**
 * Loads `journey-trace.config.json` (or .ts) from the consumer's repo root
 * if present, merging over DEFAULT_CONFIG. Config file is optional by
 * design — `init` only writes one if the user wants to customize normalize
 * rules or paths, per the zero-setup requirement.
 *
 * TODO(phase-1): implement file discovery + merge.
 */
export function loadConfig(cwd: string): JourneyTraceConfig {
  return DEFAULT_CONFIG;
}
