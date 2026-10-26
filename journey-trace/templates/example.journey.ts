// Example journey, scaffolded by `journey-trace init`.
//
// A journey is just a Playwright script wrapped in `journey(id, fn)`. There
// is no special DSL to learn — anything you can write with @playwright/test
// locators works here. journey-trace instruments `page` to capture an
// aria-snapshot + network summary after each step; you don't call anything
// extra to make that happen.

import { journey } from "journey-trace";

journey("example-login", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Username").fill("Admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByText("Dashboard").waitFor();
});

// Next steps:
//   1. Point this at a real environment and record the first baseline:
//        npx journey-trace record example-login --base-url https://your-uat-env.example.com
//   2. Commit the resulting file under ./.journey-trace/golden/
//   3. From then on, CI runs `journey-trace run --base-url <uat-url>` on
//      every build promoted to that environment and reports any behavior
//      change as a PR comment — see .github/workflows/journey-trace.yml
