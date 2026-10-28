import { stringify, parse } from "yaml";
import type { GoldenTrace, JourneyTrace, NormalizeRule } from "./types.js";

/**
 * Applies the project's normalize rules (regex replacements for dates, UUIDs,
 * session tokens, etc.) so that two traces of an *unchanged* journey are
 * byte-identical. Without this step, every run would show spurious diffs
 * from dynamic data — the single biggest cause of distrust in snapshot
 * testing tools, per the research that led to this design.
 *
 * Walks every string value in the trace — steps, aria snapshots, network
 * entry shapes, finalState, recursively through arrays/objects — and
 * applies each rule in array order. Rules are plain regex pattern ->
 * replacement pairs with no knowledge of any particular app; genericness
 * comes from the fact that this walker never branches on a field's name
 * or meaning, only its runtime type.
 */
export function normalizeTrace(trace: JourneyTrace, rules: NormalizeRule[]): JourneyTrace {
  return applyNormalizeRules(trace, rules) as JourneyTrace;
}

function applyNormalizeRules(value: unknown, rules: NormalizeRule[]): unknown {
  if (typeof value === "string") {
    return rules.reduce(
      (acc, rule) => acc.replace(new RegExp(rule.pattern, "g"), rule.replacement),
      value
    );
  }
  if (Array.isArray(value)) {
    return value.map((item) => applyNormalizeRules(item, rules));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, applyNormalizeRules(val, rules)])
    );
  }
  return value;
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
