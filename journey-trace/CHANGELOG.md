# Changelog

This is a running engineering diary for journey-trace, not just a release
log — every entry says **what** changed and **why**, so the founder/owner
of this product can trace back how and why the design got to where it is,
without having to reconstruct it from commit messages or conversation
history later.

Loosely follows [Keep a Changelog](https://keepachangelog.com/) conventions,
but since nothing is published/versioned yet, entries are grouped by date
rather than release number. New entries go at the top.

For the *why behind the whole product*, not just individual changes, see
[`docs/VISION.md`](./docs/VISION.md). This file is the incremental log;
VISION.md is the standing thesis.

## Unreleased

### 2026-10-25 — Implemented config loading and trace normalization

**Changed `src/cli/config.ts`:** `loadConfig()` now actually reads
`journey-trace.config.json` from the consumer's repo root if present, and
merges it over `DEFAULT_CONFIG` — previously it always returned the
defaults unconditionally. Merge rule: `journeysDir`/`goldenDir` are
overridden outright if the user supplies them; `normalize` rules the user
supplies are **appended after** the built-in UUID/timestamp rules, never
replacing them, so a consumer can't accidentally lose default protection
by adding their own rule.

**Changed `src/core/trace/serialize.ts`:** `normalizeTrace()` now walks
every string value in a captured trace — steps, aria snapshots, network
entry shapes, `finalState` — recursively through nested arrays/objects,
and applies each `NormalizeRule` via regex replace, in order. Previously
threw `not implemented`.

**Why now:** this closed a gap surfaced while re-checking the "generic,
plug-and-play for any app" requirement. Without a working config loader, a
tester had no way to add their own normalize rule for *their* app's
dynamic data (an employee name, an order number, anything that isn't a
UUID or ISO timestamp) — which meant the first time a real UAT
environment's live data rendered into a page, it would have gotten frozen
into a committed golden trace file. That's exactly the kind of leak
`docs/TRACE_FORMAT.md`'s design rules were meant to prevent, so it was
fixed before moving further down the stack.

**Verified:** `npx tsc --noEmit` passes clean after both changes. No
runtime test yet — nothing is end-to-end runnable until `capture.ts` and
`diff.ts` are implemented (see below).

**Still stubbed (`TODO(phase-1)` in `src/`):** `core/trace/capture.ts`
(`TraceRecorder`), `core/trace/diff.ts` (`diffTraces`),
`core/journey/{define,loader,runner}.ts`, `core/report/evidence.ts`,
all four `cli/commands/*.ts`, `mcp/server.ts`, and all four `mcp/tools/*.ts`.
Nothing is runnable end-to-end yet — `journey-trace init` and every other
CLI command still throw `not implemented`.

### 2026-10-25 — Documentation realignment

Rewrote root `README.md`, `journey-trace/README.md`, and added
`journey-trace/docs/VISION.md` to make the repo's documentation reflect
journey-trace as the actual product (root-level Phase 1/2 pytest+LLM work
recast explicitly as the prototyping phase that informed it, not a second
product). VISION.md captures the full decision log from the ideation
conversations: what was rejected (AI self-healing as the core feature, a
new plain-English DSL, an in-house root-cause classifier, PR-time
triggering) and why, versus what was accepted (deterministic git-native
diffing, full-journey trace shape, model-agnostic MCP exposure, true
plug-and-play distribution) and why — so none of that reasoning depends on
conversation history surviving.

### Earlier — Initial scaffold

Repo cleaned of an unrelated "Vibe" social app that had been mixed into
this directory. Two rounds of market research conducted (funded/established
players, then indie/OSS prior art — see `/reports/` and `/research_notes/`
at the repo root) to find a defensible, differentiated angle. Landed on:
deterministic full-journey golden-trace testing, diffed structurally with
zero AI in the core product, exposed via MCP so classification is left to
whatever AI agent or human the consumer already uses.

Scaffolded the `journey-trace` package: type definitions
(`core/trace/types.ts`), CLI wiring (`cli/index.ts`, using `commander`),
MCP tool contracts (4 tools: `list_journeys`, `get_latest_run_diff`,
`get_trace`, `approve_baseline` — the last being the only write path),
trace format spec (`docs/TRACE_FORMAT.md`), and templates (example journey,
GitHub Actions CI workflow). All logic bodies left as `TODO(phase-1)`
stubs at this point.
