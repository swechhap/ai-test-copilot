/**
 * `journey-trace init`
 *
 * The entire "setup" a consuming developer ever does:
 *   npm install journey-trace
 *   npx journey-trace init
 *
 * Scaffolds, non-destructively (never overwrites existing files):
 *   ./journeys/example.journey.ts        <- from templates/example.journey.ts
 *   ./.journey-trace/golden/.gitkeep
 *   ./.github/workflows/journey-trace.yml <- from templates/ci/github-actions.yml
 *
 * Deliberately does NOT create any config file, database, or service —
 * per the plug-and-play requirement, there is nothing else to stand up.
 *
 * TODO(phase-1): implement file-copy logic with the non-destructive check.
 */
export async function initCommand(): Promise<void> {
  throw new Error("not implemented: initCommand");
}
