"""Generate QA test scenarios (as JSON) from a plain-English requirement.

Run: python generate_scenarios.py "An employee cannot submit a leave request
with an end date before the start date"

Talks to a local Ollama model (see .env). Swapping to a hosted provider
later only means changing call_llm() -- the prompting and parsing logic
below stays the same.
"""
import json
import logging
import os
import re
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
SCENARIOS_DIR = Path("scenarios")

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a senior QA engineer writing test scenarios for a web application.

Given a single requirement, output a JSON array of test case objects. Each object must have exactly these fields:
- test_name: short descriptive string
- type: "positive" or "negative"
- preconditions: string describing state needed before the test runs
- steps: array of strings, each one user action
- expected_result: string describing the observable outcome
- priority: "high", "medium", or "low"

Cover at least one positive case and one negative case per requirement.

Example output for the requirement "A user cannot log in with an incorrect password":
[
  {
    "test_name": "Login fails with incorrect password",
    "type": "negative",
    "preconditions": "A registered user account exists",
    "steps": [
      "Navigate to the login page",
      "Enter a valid username",
      "Enter an incorrect password",
      "Click the login button"
    ],
    "expected_result": "An 'invalid credentials' error is shown and the user is not logged in",
    "priority": "high"
  }
]

Return only JSON. No markdown code fences, no commentary, no explanation before or after."""


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")
    return slug[:80]


def call_llm(requirement: str) -> str:
    response = requests.post(
        f"{OLLAMA_HOST}/api/chat",
        json={
            "model": OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Requirement: {requirement}"},
            ],
            "stream": False,
        },
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["message"]["content"]


def extract_json(raw: str) -> str:
    """Models sometimes wrap JSON in ```json ... ``` despite instructions not to."""
    fenced = re.search(r"```(?:json)?\s*(.*?)```", raw, re.DOTALL)
    return fenced.group(1).strip() if fenced else raw.strip()


def generate_scenarios(requirement: str) -> list[dict]:
    last_error = None
    for attempt in (1, 2):
        raw = call_llm(requirement)
        try:
            scenarios = json.loads(extract_json(raw))
            if not isinstance(scenarios, list) or not scenarios:
                raise ValueError("expected a non-empty JSON array")
            return scenarios
        except (json.JSONDecodeError, ValueError) as exc:
            last_error = exc
            logger.warning(
                "Attempt %d: model returned malformed JSON (%s). Raw response:\n%s",
                attempt, exc, raw,
            )
    raise RuntimeError(
        f"Failed to get valid JSON after 2 attempts: {last_error}"
    )


def main():
    if len(sys.argv) != 2:
        print('Usage: python generate_scenarios.py "some requirement"')
        sys.exit(1)

    requirement = sys.argv[1]
    scenarios = generate_scenarios(requirement)

    SCENARIOS_DIR.mkdir(exist_ok=True)
    out_path = SCENARIOS_DIR / f"{slugify(requirement)}.json"
    out_path.write_text(json.dumps(scenarios, indent=2))

    logger.info("Saved %d scenario(s) to %s", len(scenarios), out_path)


if __name__ == "__main__":
    main()
