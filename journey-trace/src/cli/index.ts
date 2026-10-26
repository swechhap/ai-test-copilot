#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { recordCommand } from "./commands/record.js";
import { runCommand } from "./commands/run.js";
import { mcpCommand } from "./commands/mcp.js";

const program = new Command();

program
  .name("journey-trace")
  .description(
    "Deterministic, git-native golden-trace testing for Playwright user journeys."
  )
  .version("0.1.0");

program
  .command("init")
  .description("Scaffold ./journeys, ./.journey-trace/golden, and a CI workflow into the current repo.")
  .action(initCommand);

program
  .command("record <journeyId>")
  .description("Run a journey against a trusted environment and write/overwrite its golden trace. Always human-triggered.")
  .requiredOption("--base-url <url>", "URL of the environment to record the baseline from")
  .action((journeyId: string, opts: { baseUrl: string }) =>
    recordCommand({ journeyId, baseUrl: opts.baseUrl })
  );

program
  .command("run")
  .description("Run journeys against a URL and diff against committed golden traces. Intended for CI, triggered on UAT/pre-prod build promotion.")
  .requiredOption("--base-url <url>", "URL of the environment to test")
  .option("--journey <journeyId>", "Run only this journey (default: all configured journeys)")
  .action((opts: { baseUrl: string; journey?: string }) =>
    runCommand({ baseUrl: opts.baseUrl, journeyId: opts.journey })
  );

program
  .command("mcp")
  .description("Start the MCP server (stdio) so an AI agent can query journey-trace evidence directly.")
  .action(mcpCommand);

program.parse();
