# journey-trace

Deterministic, git-native golden-trace testing for Playwright user journeys —
with an MCP server so an AI agent can reason about *why* a journey changed,
without journey-trace ever needing to run, host, or pay for an LLM itself.

## Why this exists

Most "AI testing" tools either generate/heal Playwright code or classify
flaky tests with an LLM. journey-trace deliberately does neither. It fills
a narrower, unaddressed gap: a **full-journey golden-trace** (DOM state +
network behavior + step sequence, not just pixels or a single locator),
committed to git like a snapshot test, diffed deterministically with zero
AI involved — and only handed to an AI (via MCP, bring-your-own-model) once
there's something structurally different worth reasoning about.

Designed to run against a UAT/pre-prod environment on every build
promotion — not pre-merge — because that's where real UAT already happens,
with real data, as the actual gate before release to customers. See
`templates/ci/github-actions.yml`.

For the reasoning behind every one of these decisions — the market gaps
that justify them and the alternatives we deliberately rejected — see
[`docs/VISION.md`](./docs/VISION.md).

## Who this is for

Test automation engineers and QA architects who already maintain (or want
to maintain) a set of Playwright scripts covering an application's critical
end-to-end journeys — login, checkout, approval flows, anything where a
regression means a real UAT user, not just a unit test, hits a wall — and
who need confidence that those journeys still work every time a build is
promoted toward production, especially as more of the code changing
underneath them is AI-generated and reviewed faster than a human can
manually re-click every journey.

## How it helps a tester, concretely

Without journey-trace, "did this release break the leave-approval journey?"
means either manually re-clicking through it on the UAT environment every
release, or trusting a pixel-diff/locator-only test that can't tell you
*why* something changed — only that a screenshot or selector differs.

With journey-trace:

1. You write the journey once as a **plain Playwright script** — no new
   DSL, no record-and-playback black box.
2. You capture a **golden trace** against a trusted environment and commit
   it to git — it becomes part of the normal PR review process, readable
   as a YAML diff like any other file.
3. Every time a build reaches your UAT/pre-prod environment, CI runs the
   journey again and diffs it against the committed golden trace —
   structurally, field by field: did a step disappear, did the aria
   snapshot change, did a network call's status or shape change, did a
   console error appear that wasn't there before.
4. If nothing changed structurally, CI passes — no AI call happened, no
   cost was spent, no non-determinism was introduced.
5. If something *did* change, journey-trace doesn't guess whether it's a
   regression. It hands the evidence bundle to whatever AI agent you
   already use (Claude, Cursor, etc.) over MCP, so the agent can reason
   about root cause with full context — and a human still has to approve
   the change before it becomes the new baseline.

You get full-journey regression coverage (not just visuals, not just one
locator) that is reviewable in git, costs nothing to run when nothing
changed, and never silently "heals" itself out from under you.

## Install (the entire setup)

```bash
npm install journey-trace
npx journey-trace init
```

That's it — no database, no server, no account. `init` scaffolds:
- `journeys/example.journey.ts` — a plain Playwright script
- `.journey-trace/golden/` — where committed baselines live
- `.github/workflows/journey-trace.yml` — wire in your own environment URL

## End-to-end workflow

```bash
# 1. Write a journey — see templates/example.journey.ts
#    (just a Playwright script wrapped in journey(id, fn))

# 2. Capture its golden trace against a trusted environment, once,
#    and commit the resulting YAML file. The only command that writes
#    to .journey-trace/golden/ — always human-triggered.
npx journey-trace record approve-leave-request --base-url https://uat.example.com

git add .journey-trace/golden/approve-leave-request.yaml
git commit -m "Add golden trace for approve-leave-request journey"

# 3. Wire templates/ci/github-actions.yml into your pipeline so it runs
#    whenever a build is promoted to UAT — not on every PR commit.

# 4. CI runs this on every promotion. Non-zero exit = at least one
#    journey diverged from its golden trace.
npx journey-trace run --base-url https://uat.example.com

# 5. When something diverges, point your AI client at the MCP server
#    to get a curated evidence bundle instead of raw logs:
npx journey-trace mcp
```

In your AI client, ask it to call `get_latest_run_diff` for the failing
journey — it gets the full structural diff (not just "test failed") and
can reason about whether it's an intended change (ship it, then approve
the new baseline via `approve_baseline`) or a real regression (file it as
a bug) — the human always makes the final call.

## CLI

| Command | What it does |
|---|---|
| `journey-trace init` | Scaffold journeys dir, golden dir, CI workflow. Non-destructive. |
| `journey-trace record <id> --base-url <url>` | Run a journey against a trusted env, write/overwrite its golden trace. The only command that writes to `.journey-trace/golden/`. Always human-triggered. |
| `journey-trace run --base-url <url> [--journey <id>]` | Run journeys against a URL, diff vs golden traces, print an evidence report. Non-zero exit on any divergence — meant for CI. |
| `journey-trace mcp` | Start the MCP server (stdio) so an AI agent can query the above directly. |

## Trace format

See [`docs/TRACE_FORMAT.md`](./docs/TRACE_FORMAT.md) for the full spec and
example. Short version: YAML, git-diffable, normalized so an unchanged
journey always produces a byte-identical trace, shapes instead of raw
network payloads.

## MCP server

Four tools, three read-only:

| Tool | Purpose |
|---|---|
| `list_journeys` | Discover configured journeys |
| `get_latest_run_diff` | Curated evidence bundle for one journey's last CI run vs. golden — the main tool for AI root-cause reasoning |
| `get_trace` | Fetch raw golden/last-run trace content |
| `approve_baseline` | **The only write tool.** Promotes a run trace to golden — must only ever follow an explicit human confirmation in the calling client |

journey-trace never emits a verdict ("this is a regression") itself —
only structural, boolean divergences. Classification is left entirely to
whatever AI agent or human reads the evidence bundle.

## Status

Phase 1 scaffold — types, CLI shape, and MCP tool contracts are defined;
implementation bodies are stubbed with `TODO(phase-1)` markers. See each
file under `src/` for the intended behavior before filling it in.

## License

MIT
