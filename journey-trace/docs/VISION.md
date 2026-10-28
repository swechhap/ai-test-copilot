# VISION — why journey-trace exists, and why it looks like this

This document is for whoever owns this product's direction next — think of
it as the founder's notebook: the problem, the market research that shaped
it, every major design decision, the alternative we considered and rejected
for each, and what's deliberately still out of scope. If you only read one
doc before changing the roadmap, read this one.

## The problem

Enterprises release faster than ever, and an increasing share of the code
reaching production was AI-generated or AI-reviewed. Real acceptance
testing — UAT — happens **post-merge, on a shared pre-prod environment with
real accumulated data**, as the actual gate before customers see a release.
That environment, and that step, is where regressions either get caught or
don't.

Two things are true about UAT today for most teams:

1. It's largely manual — a human re-clicking through known-important
   journeys (login, checkout, approval flows) after every promotion,
   because screenshot diffs and single-locator tests can't tell you
   *why* something changed, only *that* it did.
2. As PR volume rises, the people doing that manual click-through don't
   scale with it. Something has to absorb that load without becoming
   another thing nobody trusts.

The founding question behind this product: **what's the smallest, most
trustworthy primitive that lets an AI agent help with that, without asking
anyone to trust an AI agent to just fix things on its own?**

## What the market already does (and why none of it was the answer)

Two rounds of research back this (see `/reports/AI test automation market
gaps.md` and `/research_notes/AI test automation market gaps/` at the repo
root for the full write-ups). Summary of what mattered:

- **Established players** (Testim, Mabl, Katalon, Functionize, ACCELQ,
  Reflect, Autify, QA Wolf, Applitools, Percy, BrowserStack, LambdaTest,
  Rainforest QA, Virtuoso, Testsigma) overwhelmingly sell **self-healing
  locators** and record-and-playback codegen. The recurring enterprise
  complaint isn't that healing doesn't work — it's that senior automation
  engineers don't **trust** changes an AI made to their tests without
  being able to see or approve the reasoning. Funding in this space is
  consolidating around exactly this feature, not differentiating on it.
- **AI-native agentic startups and even Playwright's own tooling**
  (Stagehand, ZeroStep, Octomind, Momentic, `@playwright/mcp`) lean into
  natural-language-to-test and autonomous browsing agents. Powerful, but
  non-deterministic and costly at scale — every run can involve LLM calls,
  and two runs of "the same" test can take different paths.
- **Indie/OSS landscape** told a sharper story:
  - AI **root-cause classifiers** (regression vs. locator-drift vs. test
    data vs. environment flake) are a crowded, low-differentiation
    graveyard — 12+ solo repos attempting this, all under 15 GitHub stars,
    no breakout winner.
  - Plain-English/Gherkin-style journey DSLs already have a decisive,
    **non-AI** winner: `vitalets/playwright-bdd` (817 stars, ~469k weekly
    npm downloads). A new DSL competing with that for zero differentiation
    is a waste of effort. The AI-flavored attempts at the same idea
    (~10 projects) all sit under 110 stars.
  - MCP servers for **trace-replay or failure-triage** are nearly
    nonexistent — two near-zero-star repos were the only prior art found.
    This was the clearest open lane.

The conclusion: don't compete on healing (crowded, trust-poor), don't
invent a DSL (already won by an incumbent), don't build a classifier
(crowded, no winner, erodes trust by design). Build the thing nobody's
built — a deterministic, full-journey, git-native trace primitive — and
expose it to AI over MCP instead of embedding AI inside it.

## Decisions made during ideation (and what we rejected)

Each of these was argued through, not assumed. Recorded here so a future
owner doesn't accidentally re-litigate ground already covered — or knows
exactly when it's legitimate to.

**1. Reject: AI self-healing locators as the core feature.**
Rejected because it's the most crowded part of the market, and because
autonomous healing is precisely what erodes trust — it can silently mask
a real regression by "fixing" a test that should have failed. If healing
ever gets added later, it must be human-approved, never automatic.

**2. Reject: inventing a new plain-English/Gherkin-style journey DSL.**
`playwright-bdd` already won this with hundreds of thousands of weekly
downloads and zero AI involved. journey-trace's journeys are **plain
Playwright scripts**, wrapped in a single `journey(id, fn)` call — the
only API surface a consumer has to learn. No DSL to maintain, parse, or
market against an incumbent.

**3. Reject: an in-house AI root-cause classifier.**
Tempting — "tell me if this is a real bug" is the obvious AI feature to
reach for. Rejected because (a) the indie market already tried this a
dozen times with no winner, (b) a classifier's output is inherently
non-deterministic and unaudited, which is the exact trust problem
enterprises already have with the established players, and (c) it bakes
in LLM cost and a specific vendor at the core of the product. Instead,
journey-trace produces a **structural evidence bundle** (what changed,
where, by how much) and leaves classification entirely to whatever AI
agent or human the user already has, via MCP. journey-trace itself never
emits a verdict.

**4. Reject: triggering primarily on every pull request.**
Early design (walked back mid-conversation after being challenged) treated
this as pre-merge "shift-left" smoke testing. That's a different, useful,
but *different* thing from UAT. Real UAT is **post-merge**, against a
shared pre-prod environment carrying real accumulated data, as the actual
release gate. journey-trace's primary trigger is **build promotion to that
environment**, not PR commits. A lighter pre-merge "smoke check" using the
same primitive is a plausible future mode, but it is explicitly secondary
and must never be confused with UAT in product messaging.

**5. Accept: deterministic, git-native golden-trace diffing as the core.**
Borrowed the proven shape of Jest snapshot testing and Playwright's own
`toMatchAriaSnapshot`/`toHaveScreenshot` conventions — committed baseline
files, reviewed as a normal PR diff, zero infrastructure. `diffTraces()` is
pure structural comparison. No fuzzy matching, no confidence score,
anywhere in this layer.

**6. Accept: the trace captures a full journey, not a single locator or a
pixel.** DOM state (aria snapshot), network behavior (shape, not raw
payloads — avoids ever committing real UAT data to git), step sequence,
and console errors, together, per step. This specific shape was the
identified whitespace — pixel diffing (Percy, `toHaveScreenshot`) and
locator-only self-healing both already exist; a *structural, full-journey*
trace did not.

**7. Accept: model-agnostic, bring-your-own-model, via MCP.** journey-trace
never calls, hosts, or pays for an LLM. It exposes `list_journeys`,
`get_trace`, and `get_latest_run_diff` (read-only) plus `approve_baseline`
(the only write tool, and only ever behind an explicit human confirmation
in the calling client). Whatever AI client the team already pays for and
trusts does the reasoning. This also sidesteps the "LLM cost at scale"
pain point enterprises raised about agentic competitors.

**8. Accept: true plug-and-play distribution.** `npm install journey-trace`
+ `npx journey-trace init` + one CI workflow file. No hosted backend, no
database, no account. State lives as committed YAML files in the
consumer's own repo — the same reason Jest snapshots and `playwright-bdd`
are trivial to adopt. This was a hard requirement raised directly: a
developer must be able to adopt this with nothing beyond installing a
dependency.

**9. Defer: Selenium → Playwright migration governance.** Identified as a
genuine enterprise-grade opportunity (regulated industries especially want
an audited migration trail), but explicitly scoped to **after** Phase 1 is
demoable and proven, not before. Don't dilute a focused Phase 1 pitch.

## Where this sits against the five ranked market directions

The original market report ranked five defensible wedges: (1) a root-cause
triage layer, (2) governed audit-trail-native healing, (3) a model-agnostic
"heal gateway," (4) deterministic trace-replay for AI-authored tests, and
(5) Selenium→Playwright migration governance. journey-trace deliberately
occupies **(4) as its core**, structured so that (1) becomes something an
MCP-connected agent does *on top of* journey-trace rather than something
journey-trace does itself — getting the value of (1) without inheriting
its crowded, trust-poor reputation. (2) and (3) are natural, compatible
Phase 2 extensions once (4) is proven (an audit log of who approved which
baseline, when, is nearly free to add on top of the existing
`approve_baseline` tool). (5) is explicitly deferred per decision #9.

## Roadmap

- **Phase 1 (current)** — deterministic trace capture, structural diff,
  CLI (`init`/`record`/`run`/`mcp`), MCP tool contracts. Scaffolded; logic
  bodies marked `TODO(phase-1)`. Next: dogfood against the OrangeHRM demo
  already used in this repo's Phase 1/2 prototype (see root `README.md`).
- **Phase 2** — audit trail on `approve_baseline` (who approved what,
  when, linked to which requirement/ticket); PR-comment-formatted evidence
  bundles (`formatAsMarkdown`); optional hosted dashboard for teams that
  want one, without making it a requirement.
- **Phase 3** — Selenium→Playwright migration governance tooling, per
  decision #9.

## What never changes, regardless of phase

- journey-trace itself never runs, hosts, or pays for an LLM.
- journey-trace never emits a verdict — only structural divergences.
- The only write path to a golden trace or baseline is human-triggered.
- Adoption never requires more than installing a dependency and committing
  files that already live in the consumer's own repo.
