import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { JourneyTraceConfig } from "../core/trace/types.js";

export const DEFAULT_CONFIG: JourneyTraceConfig = {
  journeysDir: "./journeys",
  goldenDir: "./.journey-trace/golden",
  normalize: [
    { pattern: "\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b", replacement: "<uuid>", description: "UUIDs" },
    { pattern: "\\b\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z?\\b", replacement: "<timestamp>", description: "ISO timestamps" }
  ]
};

const CONFIG_FILENAME = "journey-trace.config.json";

/**
 * Loads `journey-trace.config.json` from the consumer's repo root if
 * present, merging over DEFAULT_CONFIG. Config file is optional by
 * design — `init` only writes one if the user wants to customize normalize
 * rules or paths, per the zero-setup requirement.
 *
 * Merge semantics, chosen so the config stays app-agnostic machinery with
 * app-specific content supplied by the consumer:
 * - `journeysDir`/`goldenDir`: user value wins outright if present.
 * - `normalize`: user rules are appended AFTER the built-in defaults, never
 *   replacing them — so a consumer can add a rule for their own app's
 *   dynamic data (e.g. an employee name, an order number) without losing
 *   the default UUID/timestamp handling.
 */
export function loadConfig(cwd: string): JourneyTraceConfig {
  const configPath = join(cwd, CONFIG_FILENAME);
  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  const userConfig = JSON.parse(readFileSync(configPath, "utf-8")) as Partial<JourneyTraceConfig>;

  return {
    journeysDir: userConfig.journeysDir ?? DEFAULT_CONFIG.journeysDir,
    goldenDir: userConfig.goldenDir ?? DEFAULT_CONFIG.goldenDir,
    normalize: [...DEFAULT_CONFIG.normalize, ...(userConfig.normalize ?? [])]
  };
}
