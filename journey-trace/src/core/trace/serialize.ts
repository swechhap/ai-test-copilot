import { stringify, parse } from "yaml";
import type { GoldenTrace, JourneyTrace, NormalizeRule } from "./types.js";

/**
 * Applies the project's normalize rules (regex replacements for dates, UUIDs,
 * session tokens, etc.) so that two traces of an *unchanged* journey are
 * byte-identical. Without this step, every run would show spurious diffs
 * from dynamic data — the single biggest cause of distrust in snapshot
 * testing tools, per the research that led to this design.
 *
 * TODO(phase-1): implement — walk every string field in a JourneyTrace and
 * apply each NormalizeRule in order.
 */
export function normalizeTrace(trace: JourneyTrace, rules: NormalizeRule[]): JourneyTrace {
  throw new Error("not implemented: normalizeTrace");
}

/**
 * Serializes a trace to the canonical, git-diffable YAML form used for
 * golden files. Key order must be stable (insertion order, not alphabetical)
 * so diffs read like a human-authored change log, not a reshuffled blob.
 *
 * TODO(phase-1): implement with `yaml.stringify`, explicit key ordering.
 */
export function serializeGoldenTrace(trace: GoldenTrace): string {
  return stringify(trace);
}

export function parseGoldenTrace(contents: string): GoldenTrace {
  return parse(contents) as GoldenTrace;
}
