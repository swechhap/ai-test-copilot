# AI Test Copilot

A learning project in two parts:

1. **Phase 1** — a Playwright + pytest UI test suite (Page Object Model) against the
   [OrangeHRM demo site](https://opensource-demo.orangehrmlive.com).
2. **Phase 2** — an LLM-powered script that turns a plain-English requirement into
   structured QA test scenarios (JSON).

The long-term goal is to connect the two: generate scenarios with an LLM, then have
them turned into runnable Playwright tests.

## Project structure

```
config.py               # env-driven config (base URL, demo credentials)
conftest.py              # pytest fixtures: auth session, page objects, test data
pytest.ini                # pytest config: markers, browser, screenshots/video on failure
pages/                    # Page Object Model — one class per screen
  base_page.py
  login_page.py
  dashboard_page.py
  employee_page.py
  leave_page.py
tests/                    # the Phase 1 test suite
  test_login.py
  test_employee.py
  test_leave.py

hello_llm.py               # Phase 2 step 1: smallest possible LLM call
generate_scenarios.py      # Phase 2 step 2: requirement -> JSON test scenarios
scenarios/                  # generated output, one JSON file per requirement
```

## Prerequisites

- Python 3.11+
- [Ollama](https://ollama.com) installed and running locally (used for Phase 2 —
  no paid API key required). Alternatively, swap in an Anthropic or OpenAI key
  (see [Phase 2](#phase-2--llm-test-scenario-generation) below).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## Phase 1 — UI test suite

Runs against the public OrangeHRM demo (`https://opensource-demo.orangehrmlive.com`
by default, using the demo's published `Admin` / `admin123` credentials). Override
either via environment variables or `.env`:

```bash
ORANGEHRM_BASE_URL=...
ORANGEHRM_USERNAME=...
ORANGEHRM_PASSWORD=...
```

### Run the tests

```bash
pytest                          # full suite
pytest tests/test_login.py      # a single file
pytest -m "not crud"            # skip tests that create/delete data
pytest --base-url=https://...   # point at a different environment
```

Failure artifacts (screenshots, video) are written to `artifacts/`.

### Notes on design

- **Page Object Model**: every screen is a class in `pages/`, exposing locators and
  actions so tests never touch raw selectors.
- **Session reuse**: `conftest.py` logs in once per test session and replays the
  storage state into each test's browser context — tests that need to be logged
  out use `@pytest.mark.anonymous`.
- **`crud` marker**: tests that create/delete real data on the shared demo
  instance (e.g. adding an employee) are marked `crud` so they can be excluded
  when running against a shared environment others depend on.

## Phase 2 — LLM test scenario generation

Turns a requirement like:

> "An employee cannot submit a leave request with an end date before the start date"

into a JSON array of structured test cases (`test_name`, `type`, `preconditions`,
`steps`, `expected_result`, `priority`).

### LLM backend

By default this uses a **local Ollama model** — no API key, no cost. Pull a model
and make sure the server is running:

```bash
ollama pull gemma4        # or another model of your choice
ollama serve               # usually already running as a background service
```

Configure the model in `.env` (see `.env.example`):

```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma4:latest
```

**Using a hosted provider instead (Anthropic/OpenAI):** drop your key into `.env`
as `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` and swap the request in `call_llm()`
(inside `generate_scenarios.py`) for that provider's SDK/endpoint — the rest of
the script (prompting, JSON parsing, retry logic) is provider-agnostic.
`.env` is gitignored — never commit an API key.

### Usage

```bash
# 1. sanity check — smallest possible call, prints the raw response shape
python hello_llm.py

# 2. generate scenarios for a requirement
python generate_scenarios.py "An employee cannot submit a leave request with an end date before the start date"
```

Output is saved to `scenarios/<slugified-requirement>.json`.

### Prompting approach

`generate_scenarios.py` combines three techniques:

1. **Role prompting** — "You are a senior QA engineer..."
2. **Few-shot example** — the system prompt includes one fully-formed example of
   the exact JSON shape expected.
3. **Explicit negative instruction** — "Return only JSON. No markdown code
   fences, no commentary."

### Robustness

LLMs occasionally return malformed or markdown-wrapped JSON despite instructions.
The script:

- Strips ` ```json ... ``` ` fences defensively even though the prompt says not
  to add them.
- Retries once on a parse failure, logging the raw response for debugging.
- Raises after two failed attempts rather than silently saving bad data.

**Lesson learned:** JSON *validity* and content *correctness* are separate failure
modes. A small local model (`llama3.2`, 2B) reliably returned syntactically valid
JSON but silently dropped instructions (e.g. missing the required positive test
case, one-step test cases). Switching to a larger model (`gemma4`) fixed content
quality immediately — a parser alone won't catch this class of failure, so the
generated output is still worth a human skim.

## Roadmap

- Turn generated scenarios into runnable Playwright tests.
- Expand scenario generation to cover more of the OrangeHRM modules already
  under test in Phase 1 (login, employee, leave).
