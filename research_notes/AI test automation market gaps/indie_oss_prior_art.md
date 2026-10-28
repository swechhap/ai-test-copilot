# Indie / Small Open-Source Prior Art: AI-Assisted & Snapshot/Golden-Trace Testing for Playwright

Research date: 2026-10-25
Method: GitHub REST API search (via authenticated `gh api search/repositories`, sorted by stars), npm registry search + `api.npmjs.org` download counts, official MCP server registry (`registry.modelcontextprotocol.io`), and targeted web search. GitHub API search gave far more precise, verifiable results (star counts, push dates, owner profiles) than general web search, which mostly surfaced SEO blog content rather than repos.

**How to read this**: for every project I list stars (GitHub) or weekly downloads (npm), last-push date, and — where I could check it — the owner's GitHub profile/bio to judge solo vs funded. "Flagged funded" = I found explicit evidence (VC round, accelerator backing, incorporated team) it's a funded company, not an indie project, even though it surfaces in these searches. Everything else is a best-effort read of a thin public signal (bio, company field, follower count) — treat as a hypothesis, not certainty, and marked "unverified" where I couldn't confirm either way.

---

## 1. Golden-trace / snapshot-style testing for Playwright (DOM, network, journeys — git-diffable, Jest-snapshot-style)

**Key finding: the core primitive now exists natively in Playwright, not as third-party indie tooling.**
Playwright core ships `locator.ariaSnapshot()` / `expect(locator).toMatchAriaSnapshot()` — a YAML-serialized accessibility-tree snapshot that is explicitly git-diffable (text, not pixels) and designed to be committed as a baseline file, à la Jest snapshots. This is a Microsoft/official feature, so it's "prior art" but not evidence of an indie gap — if anything it narrows the space indie tools can fill, because the most Jest-snapshot-like approach for DOM state is now built-in. It only covers the accessibility tree, though — not network calls or multi-step journey state, which remains open.

Indie tooling built *around* this primitive (not replacements for it) is thin:
- `mkaranam59/playwright-locator-picker` — 0 stars — Chrome/Edge extension to pick an element and get its ARIA-snapshot YAML in Playwright's own format. Tiny, very recent, solo-looking hobby project.

**Pixel-based visual snapshot/golden-file testing** (the more common interpretation) is a mature, crowded space, mostly either (a) built into `@playwright/test` itself (`toHaveScreenshot`), or (b) funded-company SaaS (Applitools, Percy, Argos CI, Chromatic) — none of which are indie. A few small indie wrappers exist:
- `iloveitaly/pytest-playwright-visual-snapshot` — 13 stars, actively pushed (Oct 2026) — "easy pytest visual regression testing using playwright." Solo-looking, MIT.
- `kumaraditya303/pytest-playwright-snapshot` — 24 stars but dormant since 2022.
- `@ayroblu/playwright-image-snapshot` (npm) — enhanced screenshot comparisons for `@playwright/test`, small scoped-package, last published 2022, low traction.

**Network/API "golden trace" replay** (HAR-record/replay as a baseline, contract-test style): I could not find any indie npm/GitHub project doing this as a distinct "golden trace" product for Playwright. Playwright itself has built-in `page.routeFromHAR()` for HAR record/replay, but no indie layer wraps it into a snapshot-testing workflow with diffable baselines. **This looks like a genuine gap** — no small open-source project is doing "Jest-snapshot but for network calls" on top of Playwright.

**Journey-level "golden trace" (full user-journey state snapshotting, not just DOM or network alone)**: Several small/indie projects gesture at this concept under names like "golden profile," "deterministic replay," or "golden-flow regression," but nearly all are either single-digit-star hobby repos or thin wrappers around an LLM call, not mature tooling:
- `SAY-5/pagerunner` — 0 stars — "deterministic replay, and golden-flow regression tests" for a browser-agent orchestration platform. Very early, no license info checked, unverified traction.
- `Prabal-Singh/fixturebench` — 0 stars — golden-fixture scoring for a narrow procurement-agent benchmark, not general E2E.
- `ShantanuVr/playwright-self-healing-framework` — 2 stars — "scores the live DOM against a semantic fingerprint" (closer to a golden-trace idea for locators specifically, not full journeys). Explicitly "Zero LLMs, zero API keys" — notable because it's a non-AI deterministic approach, built by one person (bio: "Lead QA Engineer").

**Conclusion for Q1**: Pixel visual-regression testing for Playwright is solved (natively + funded SaaS). Accessibility-tree/DOM-state snapshotting is now solved *natively* by Playwright itself. Network-call golden-trace snapshotting and full-journey golden-trace testing (the more interesting "git-diffable baseline of an entire user journey" idea) remain largely unaddressed at the indie/OSS layer — the handful of repos that use the word "golden" in this context are nearly all 0–2-star, very recent, single-maintainer experiments, several of which are really AI-agent side projects that borrowed the term rather than mature snapshot-testing frameworks.

---

## 2. AI-based root-cause classification of test failures (regression vs flaky vs environment vs locator drift)

This is a genuinely active indie/hobbyist niche — the GitHub topic `flaky-test-detection` and free-text searches for "root cause" + "flaky" + "AI classify" turned up a cluster of very recent (mostly Sept–Oct 2026), very small (0–1 star) solo projects:

| Project | Stars | Last push | Notes |
|---|---|---|---|
| `Shivani26Singh/playwright-flaky-analyzer` | 1 | 2026-09-10 | Published on npm as `playwright-flaky-analyzer` (13 weekly downloads). Explicitly "Fully offline, no AI" — rule-based cross-run classification, root-cause rules, failures grouped by shared cause, HTML/JSON/MD reports, CI gate. Owner bio: "Senior QA Engineer... Building AI-powered QA tools" — solo, hands-on QA engineer. |
| `AKogut/ai-flaky-test-triage` | 1 | 2026-10-20 | "Classifies every failure on two orthogonal axes, hypothesises root cause, and posts one PR comment... evaluated against a hand-labelled golden dataset and a non-LLM baseline." Owner bio lists two small companies ("@forma-finance @zagaday") — looks like a side project by an SDET, not a funded startup. |
| `Joshva-Jashper/Real-time-Health-Sentinel` (TestSentry) | 1 | 2026-10-09 | AI failure categorization with confidence scores + caching to cut AI call costs. Owner is a student — clearly a learning/hobby project, thin traction. |
| `tashikomaaa/notmyfault` | 1 | 2026-09-18 | GitHub Action: "tells you whether a failing test is your fault, a known flaky test, or already broken on main." No server, no deps. Owner company field: "assoverse" (small/unclear) — likely indie. |
| `AleksandrJelohhin/flaketriage` | 0 | 2026-09-21 | Flaky-vs-regression via JUnit XML, failure fingerprinting, diff blame, optional LLM triage. Solo author (4 followers), no bio. |
| `FelixMiddelhoff/deflake` | 0 | 2026-10-19 | Root-cause diagnosis distinguishing timing sensitivity, order dependency, parallelism issues. Solo (0 followers, no bio) — brand-new, thin.|
| `manijose1919/flakeradar` | 0 | 2026-08-28 | Self-hosted flaky detection, JUnit ingestion, statistical scoring, GitHub issue automation. Owner bio explicitly: **"Solo developer out of hobby and practice."** Clean confirmation of indie status. |
| `rowhitswami/flakestat` | 0 | 2026-09-22 | Local CLI flaky-test finder across pytest/Jest/go test/JUnit, "no SaaS, no account." Author (421 followers) looks like an established individual OSS contributor, not AI-based (statistical/local). |
| `jubeixu/FlakeLedger` | 11 | 2026-09-11 | Quantifies compute/dev-time cost of flaky tests from JUnit XML, Python stdlib only, no LLM. Owner bio: "ML Engineer... Quanta Labs" — possibly a side project from someone at a small AI shop; **unverified** whether Quanta Labs is funded or a 2-person shop. |
| `anusha-saxena/repair-ai-agent` | 0 | 2026-09-16 | Detects flaky Python tests via controlled perturbation experiments, classifies root cause, proposes/validates a fix via an AI agent. Recent, unverified traction. |
| `asalvi7/regression-failure-classifier` | 0 | 2026-07-17 | Classifies failures into defect/environment/flaky-script/data-mismatch buckets from logs. Very thin, early-stage. |
| `@codept/flakescope-classify` (npm) | — | pub 2026-09-25 | "Deterministic classification of Playwright flaky and failing tests from a flake-report.json." 12 weekly downloads — negligible traction so far. |

Dashboards that bundle this classification into a reporting UI (open-core, not pure OSS — both ship under a non-standard "Other" license, suggesting a source-available/monetization model rather than permissive OSS):
- `PiwiTests/piwi` — 40 stars, pushed same day as this research (2026-10-25) — "Self-hosted Playwright dashboard with run history, failure clustering, flaky scoring, locator healing, browser extension, desktop companion app." Org bio is just the product description (2 followers) — looks like a 1–2 person micro-SaaS/open-core project, not VC-funded, but monetization intent is clear from the license choice.
- `kinora-dev/kinora` — 39 stars, pushed 2026-10-25 — dashboard for Playwright/Vitest/Storybook test results across projects/time. Same profile: single-purpose org account, "Other" license, likely solo/duo indie project with a commercial angle.

**Conclusion for Q2**: This is the single most active indie-builder niche uncovered in this research. Dozens of solo engineers (mostly self-described QA/SDET professionals, several explicitly "hobby" projects) have shipped small flaky-vs-real-regression classifiers in the last 2–3 months, almost all under 15 stars and under 20 npm weekly downloads. None has broken out — there is no clear "winner" at the indie scale yet, which itself suggests the problem is validated (many people building it) but no single implementation has achieved product-market fit at the OSS layer. This is a crowded-but-shallow space: lots of near-identical first drafts, little consolidation or community adoption.

---

## 3. "UAT as code" / "user journey as code" — plain-language journeys compiled to Playwright

No hits at all for literal phrases "UAT as code" or "journey as code" + testing. The actual terminology indie builders use is **"plain English"** tests, which is a much richer vein:

| Project | Stars | Notes |
|---|---|---|
| `dmoka/quicke2e` | 102 | By far the most-starred solo project found in this category. "Plain-English end-to-end tests for web apps. A small decision model picks each click; code decides pass or fail; a passing run exports a Playwright spec." Owner `dmoka` (Daniel Moka) — solo dev, 75 followers, bio: "Software craftsman... TDD & Clean Code enthusiast." Clearly an individual side project, MIT-licensed, actively pushed Oct 2026. **Best indie example found for Q3.** |
| `NihadMemmedli/quorvex_ai` | 45 | Converts plain-English specs to self-healing Playwright tests; also does load/security/API/LLM testing. Broader scope, single named author, looks solo. |
| `heroamogs/flowstride-os` | 14 | "BDD-flavored E2E framework... plain-English test steps with Playwright, unified API testing, real-time React debugging dashboard." Owner: solo QA engineer, 1 follower — early-stage indie. |
| `sedum-dev/sedum` | 14 | "Plain-English browser e2e tests cheap enough to run on every PR. Built on Jev and Playwright, open source, bring-your-own-key." Built on top of **"Jev"** — a third-party "typed decision model" by **TypeSafe AI** — so sedum itself looks like a small/indie wrapper, but it depends on an external model whose funding status is unverified; flag the dependency as a risk for anyone evaluating sedum's "open source" claim (the decision logic itself isn't owned by the project). |
| `hamc/blastproof` | 11 | "Plain-English YAML, no selectors" for blast-radius-aware PR test selection + generation, BYOK, local-first — more of a change-impact tool than pure journey-as-code, but uses the same plain-language-YAML pattern. |
| `JoshFerge/tempest` | 7 | "Write your E2E tests in plain english." Minimal, early. |
| `77QAlab/step-to-code-generator` | 4 | Converts plain-English steps into Playwright/Cypress/TestCafe code — explicitly targeted at manual testers, "no coding required." |
| `khaledbourghida/specter` | 4 | Multi-agent pipeline: plain-English description → navigate/write/execute/self-heal. |
| `SaiBolisetty/Plainwright` | 2 | Self-hosted, plain-English test description → runs against browser/API/chatbot/MCP/A2A agent, BYOK across OpenAI/Claude/Gemini/Groq/Ollama. Name is a clear Playwright pun; very new, thin traction. |
| `mission-testronaut/testronaut-cli` | 6 | "Mission-based tests in plain English" via OpenAI function calling + browser automation. |
| `OTweihan/Argus` | 5 | "Describe what to test in plain English" — plans/executes/reports, no scripts. |

**BDD-flavored (Gherkin-like) journey-as-code, non-"plain English" framing**:
- `vitalets/playwright-bdd` — **817 stars**, ~**469,000 npm weekly downloads** — by far the highest-traction project found in this entire research effort. Single named maintainer (Vitaliy Potapov, "Full-stack dev," company listed as "MedTech," 729 followers) — genuinely solo-authored, not a funded testing company. It compiles Gherkin `.feature` files to Playwright test runs. This is mature, real prior art for "journey defined in business language, compiled to Playwright" — it just predates the "AI-assisted" framing and doesn't use an LLM; it's a classic BDD-to-Playwright compiler. **This is the one project in this whole report with legitimate, large-scale, verifiable production adoption.**

**Conclusion for Q3**: `playwright-bdd` (classic Gherkin, no AI) is proof that solo-built "journey as code → Playwright" tooling can achieve massive real-world adoption. The *AI-flavored* version of the same idea ("plain English" → Playwright, LLM-interpreted) is an extremely active 2026 trend among solo builders — a dozen+ nearly-simultaneous entrants (`quicke2e`, `quorvex_ai`, `flowstride-os`, `sedum`, `tempest`, `testronaut-cli`, `Argus`, `Plainwright`, `specter`, etc.) but every single one is under 110 stars and very recent (most created Sept–Oct 2026), so none has established itself as a default choice yet. This looks like a land-rush moment rather than a solved problem — lots of near-duplicate MVPs, no consolidation, and most are thin LLM-prompt wrappers rather than deep frameworks.

---

## 4/5. `playwright-mcp` community servers, "awesome-playwright"/"awesome-ai-testing" lists, and the MCP registry

**Awesome lists** (curation, not tools, but useful maps of the space):
- `mxschmitt/awesome-playwright` — 1,598 stars — maintained by a Microsoft Playwright core team member (Max Schmitt), so this is the de facto canonical list but not itself "indie prior art" in the target sense (built by a Playwright maintainer, not an outside solo tester).
- `AutomationPanda/awesome-web-testing-playwright` — 313 stars — by "The Automation Panda" (Andrew Knight), a well-known individual test-automation educator/consultant. Genuinely solo-built, respected in the testing community, good indicator of what an individual-but-prominent tester produces.
- `tugkanboz/awesome-ai-testing` — 157 stars, actively updated (Sept 2026) — curated list of AI-powered testing tools specifically (test generation, self-healing, MCP-based testing, LLM evaluation). Solo-curated, useful map but a list not a tool.
- `jaktestowac/awesome-copilot-for-testers` — 118 stars — Copilot prompts/chat-modes for test automation, maintained by "jaktestowac.pl," a small Polish test-automation education/content team (not a funded company — looks like a 2–3 person education/content studio, similar scale to Automation Panda).
- `atinfo/awesome-test-automation` — 7,196 stars — the big general (non-AI, non-Playwright-specific) test-automation awesome-list; useful context but not AI/snapshot-specific.

**`playwright-mcp`-topic / MCP server ecosystem** — the official `microsoft/playwright-mcp` (38.6k stars) and `executeautomation/mcp-playwright` (5.7k stars, solo-authored by "executeautomation" — itself a small indie-ish brand, arguably the most successful *purely community* MCP server for Playwright, predating Microsoft's official one) dominate by a huge margin. Below them, dozens of tiny (0–50 star) forks/variants exist; the ones specifically relevant to *testing/QA* (vs. generic agent browsing) are sparse:
- `terryso/claude-code-playwright-mcp-test` — 186 stars — "YAML-based Playwright MCP automation testing framework designed for Claude Code." Solo-built, decent traction for a testing-specific MCP wrapper.
- `debs-obrien/playwright-mcp-prompts` — 73 stars — collection of Playwright MCP prompts for automated/manual testing, by a well-known individual (Debbie O'Brien, a Playwright advocate) — solo-curated.
- `rakutentech/sorify` — 51 stars — "AI Agentic QA Platform... MCP for recording events for AI to write tests" — despite the personal-sounding name, this is under the `rakutentech` org, i.e. **Rakuten's internal team**, not an indie project — flagging explicitly since it could be mistaken for solo work.
- `openqa-labs/openqa` — 26 stars — "Agentic Testing Harness." Small org, unclear funding — unverified, looks like an early-stage indie/small-team effort.

**Via the official MCP registry (`registry.modelcontextprotocol.io`)**, searching "playwright" surfaced a few QA/testing-specific community servers not found via GitHub star-sort (because they're too new/low-traffic to rank):
- `hubertgajewski/playwright-report-mcp` — 0 stars, pushed Oct 2026 — "token-efficient MCP server for Playwright test failure analysis — returns only failed tests, errors, and attachments instead of dumping the full JSON report into agent context." Owner is a self-described solo "QA engineer" — a clean, verified example of an individual solving their own specific pain point (context-window bloat when feeding failure reports to an LLM) and shipping it as an MCP server. Minimal traction so far.
- `clauxel/playwright-selector-guard-mcp` — 0 stars — "Paid remote MCP for Playwright selector risk checks, healing suggestions, action receipts, human approvals, failure exports." **Not actually open-source/free** — explicitly a paid remote MCP; owner bio suggests a tiny indie SaaS ("Dauxel"), not VC-funded, but also not "open source" in the sense the research brief wants. Flagging as a commercial micro-product, not prior art for free tooling.

**Conclusion for Q4/Q5**: The curated awesome-lists are genuinely useful maps built mostly by individuals (Automation Panda, jaktestowac, tugkanboz) and are a good ongoing source to monitor. The MCP-server layer for testing specifically is very thin — most `playwright-mcp`-adjacent repos are generic browser-automation agents (job-application bots, scraping, general web agents), not test-failure-triage or golden-trace tooling. The two clearest MCP servers aimed specifically at test-failure analysis (`playwright-report-mcp`, `playwright-selector-guard-mcp`) are both brand-new, single-maintainer, near-zero-traction — this remains a wide-open gap at the MCP layer.

---

## 6. What solo/indie testers say about their own pain points (blogs, dev.to, Hashnode, etc.)

Web search here was much weaker than GitHub/npm search — results were dominated by SEO content-marketing posts from testing SaaS vendors (BrowserStack, TestDino, Saucelabs, BugBug.io) rather than genuine first-person solo-builder accounts. Two more genuine signals surfaced:

- A Hashnode post, **"From ChatGPT for Testing to Full Automation: Why I Built My Own AI Testing Tool,"** describing frustration with manually pasting DOM snippets into ChatGPT, leading the author (with a co-founder) to build "Bug0 Studio" — a "vibe testing platform" where you show the AI a recorded/described user journey and it generates the test script. **Caveat**: this has a co-founder and a branded product name/domain (bug0.com) — it reads more like an early-stage bootstrapped startup than a pure solo side project, and funding status is unverified; I'm flagging it as "possibly indie-startup, not confirmed solo hobbyist."
- No other first-person "I built this because X annoyed me, here's my star/download count" posts were found with concrete traction numbers. This is consistent with the GitHub/npm evidence: most pain-driven solo tools above (quicke2e, flaketriage, flakeradar, playwright-report-mcp, etc.) don't appear to have accompanying blog posts/write-ups at all — they were shipped quietly as repos/packages with just a README, with no evidence of promotion, which likely explains their very low stars/downloads despite solving real, specific problems.

**Conclusion for Q6**: Evidence here is thin and should be treated as inconclusive. The strongest signal from this whole research exercise about "indie pain points" actually comes from the GitHub bios themselves (e.g., "Solo developer out of hobby," "Senior QA Engineer... Building AI-powered QA tools," "Problem solver... QA engineer") rather than from blog posts — these are engineers scratching their own itch and publishing the code, but apparently not writing about it anywhere indexable.

---

## Summary table: notable projects with real traction (for quick reference)

| Project | Type | Stars/Downloads | Verified solo/indie? |
|---|---|---|---|
| `vitalets/playwright-bdd` | Gherkin→Playwright compiler | 817 stars / ~469k npm dl/week | Yes — single named maintainer |
| `microsoft/playwright-mcp` | Official MCP server | 38.6k stars | No — Microsoft |
| `executeautomation/mcp-playwright` | Community MCP server | 5.7k stars | Likely yes, long-running indie-first-mover |
| `dmoka/quicke2e` | Plain-English E2E → Playwright | 102 stars | Yes — confirmed solo |
| `tugkanboz/awesome-ai-testing` | Curated list | 157 stars | Yes |
| `jaktestowac/awesome-copilot-for-testers` | Curated list / prompts | 118 stars | Yes (small team) |
| `terryso/claude-code-playwright-mcp-test` | YAML MCP testing framework | 186 stars | Yes |
| `healwright` (amrsa1) | Self-healing Playwright locators via LLM | 7 stars / ~5.9k npm dl/week | Yes — confirmed solo ("QA Principal") |
| `passmark` (Sandeep Panda) | "Open-source AI framework for regression testing" | ~25.6k npm dl/week, repo not located/public | Unverified — author is Hashnode's co-founder/CEO; could be a personal side project or an early-stage product; **could not confirm GitHub repo exists publicly**, treat with caution |
| `playwright-testreport-io` / `testreport.io-local` (rahul1818) | Self-hosted Playwright HTML dashboard w/ flaky detection | 0 stars / ~15.9k npm dl/week each | Yes — solo, small QA services company |
| `PiwiTests/piwi`, `kinora-dev/kinora` | Self-hosted test dashboards w/ flaky scoring, failure clustering | ~40 stars each, both pushed same day as this research | Likely 1–2 person micro-SaaS (open-core license, not pure OSS) |

## Explicitly flagged as NOT indie (funded, despite surfacing in these searches)

- **Mozark** (`mozarkai/optics-framework`) — AI-native synthetic testing / self-healing locators, 63 stars. Confirmed via web search: Singapore-founded 2019, **$48M raised total incl. $40M Series B** (IFC, RMB Capitalworks, Kalaari Capital, Google Accelerator, ACT Grants). Despite an open-source-looking repo and modest star count, this is a well-funded company, not an indie project.
- **Reticle** (`reticlehq/reticle`, 1,271 stars, topic `playwright-mcp`) — confirmed via their own website: "Backed by Entrepreneurs First," multi-founder team, source-available license converting to Apache-2.0, paid team/enterprise tiers. Funded startup with an open-source SDK component — same pattern as Stagehane/Browserbase called out in the brief as something to explicitly exclude.
- **Rakuten** (`rakutentech/sorify`) — despite a personal-sounding "Sorify" product name, this is published under Rakuten's corporate GitHub org — an internal/corporate tool, not an indie project.
- **"Jev" (TypeSafe AI)** — the decision-model dependency underlying several small "plain English" tools (`sedum`, parts of `reticle`, `jev-browser-pilot`, etc.). Funding status of TypeSafe AI itself is unverified from this research, but it's clearly a product/platform with its own brand and an ecosystem of dependents, not a hobbyist's model — worth noting that several nominally "indie" testing tools are thin wrappers around this third-party model.

---

## Overall gap assessment

1. **Network-call and full-user-journey golden-trace/snapshot testing** (git-diffable baselines, Jest-snapshot-style) for Playwright is essentially unaddressed at the indie OSS layer — the strongest related primitive is Playwright's own native `toMatchAriaSnapshot`, which only covers the accessibility tree.
2. **AI-assisted flaky-vs-regression-vs-locator-drift classification** is the most crowded indie niche found — a dozen+ near-simultaneous solo entrants in the last 1–3 months, all under ~15 stars/20 npm downloads, no consolidation yet. A good signal of validated pain, poor signal of any existing "winner" to compete against or build on.
3. **Plain-English/"journey as code" compiled to Playwright** has one standout non-AI precedent with massive real adoption (`playwright-bdd`, 817 stars / ~469k weekly downloads) proving solo-built compiler-style tools can win big, plus a land-rush of ~10 brand-new AI-flavored competitors (all <110 stars, most <15), none established.
4. **MCP servers specifically for test-failure triage or golden-trace replay** are nearly nonexistent — found exactly two (`playwright-report-mcp`, `playwright-selector-guard-mcp`), both zero-star, brand-new, single-maintainer. This is the thinnest, most open layer of all six questions.
5. Watch for **open-core licensing** (PiwiTests, kinora) as a middle ground some solo builders are choosing — "source available," not permissive OSS — suggesting indie builders in this space increasingly default to a monetization-first posture rather than pure OSS, which may itself be informative for anyone weighing a fully-open vs. open-core strategy.
6. First-person indie "why I built this" write-ups are hard to find for this specific niche; the GitHub bios of solo authors are a better signal than blog search was.

## Sources consulted
- GitHub REST API search (`gh api search/repositories`), various queries across stars/topics — primary data source for this report, all star counts and push dates current as of 2026-10-25.
- npm registry search (`registry.npmjs.org/-/v1/search`) and download counts (`api.npmjs.org/downloads/point/last-week/...`).
- Official MCP registry: https://registry.modelcontextprotocol.io/v0/servers?search=playwright
- WebFetch of https://reticle.sh (funding/team evidence)
- WebSearch: Mozark funding (cmswire.com, ionanalytics.com, pitchbook.com, tracxn.com, thesaasnews.com)
- WebSearch: "Jev" model context (mindstudio.ai, latenode.com, GitHub awesome-jev lists)
- WebSearch: Hashnode "Why I Built My Own AI Testing Tool" (Bug0 Studio) — https://hashnode.com/blog/chatgpt-for-testing-alternative-playwright-automation
