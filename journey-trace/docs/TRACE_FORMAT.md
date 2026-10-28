# Golden trace file format (v1)

Golden traces are committed to `./.journey-trace/golden/<journeyId>.yaml`.
YAML, not JSON — reviewable as a normal PR diff, same convention as
Playwright's own `toMatchAriaSnapshot` baselines and Jest snapshot files.

## Design rules

1. **No dynamic data.** Every value that would differ between two clean
   runs of the same unchanged journey (timestamps, UUIDs, session tokens,
   request IDs) is stripped by a `normalize` rule before the file is
   written. If a diff ever fires on an unchanged journey, the fix is a
   normalize rule, not a confidence threshold.
2. **Shapes, not payloads.** Network bodies are summarized to their shape
   (`{ "id": "string", "items": "array(3)" }`), never stored raw — this
   bounds file size and avoids ever committing real UAT data (which, per
   the product's own design, is expected to contain real/sensitive records)
   into git history.
3. **No host, no environment.** `entryPath` and all network `path` fields
   are paths only. The same golden file is valid whether you run it against
   staging or UAT — the base URL is always a run-time argument.
4. **No pixels here.** Visual regression is Playwright's own
   `toHaveScreenshot` — journey-trace does not duplicate it.

## Example

```yaml
version: 1
journeyId: approve-leave-request
entryPath: /auth/login
steps:
  - index: 0
    action: goto
    target: /auth/login
    ariaSnapshot: |
      - heading "Login"
      - textbox "Username"
      - textbox "Password"
      - button "Login"
    network: []
    consoleErrors: []
  - index: 1
    action: click
    target: 'role=button[name="Approve"]'
    ariaSnapshot: |
      - heading "Leave Request #<id>"
      - status "Approved"
    network:
      - method: POST
        path: /api/leave/approve
        status: 200
        requestBodyShape:
          leaveRequestId: string
        responseBodyShape:
          status: string
    consoleErrors: []
finalState:
  ariaSnapshot: |
    - heading "Leave Request #<id>"
    - status "Approved"
  path: /leave/requests
```

## What a divergence looks like

`journey-trace run` diffs a freshly captured `RunTrace` (same shape, plus
`runId`/`capturedAt`/`baseUrl`, none of which are compared) against the
`GoldenTrace` above, structurally, field by field. A result is either
`identical: true`, or a list of `Divergence` objects — see
`src/core/trace/diff.ts` for the full `DivergenceKind` enum
(`step-added`, `aria-snapshot-changed`, `network-status-changed`, etc.).
There is no fuzzy/confidence score anywhere in this layer — it's a
structural equality check, nothing more. Reasoning about *why* a
divergence happened, and whether it matters, is explicitly left to the
MCP layer (`get_latest_run_diff`) and whatever AI agent or human consumes
it.
