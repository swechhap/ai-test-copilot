/**
 * `journey-trace mcp`
 *
 * Starts the MCP server over stdio so any MCP-compatible client (Claude
 * Desktop, Cursor, VS Code Copilot, a CI bot) can query this repo's
 * journey-trace state directly. See src/mcp/server.ts for the tool
 * definitions. This is how "AI root-cause classification" happens in this
 * product — we never build or host a classifier ourselves; we hand
 * curated evidence to whichever model the user already has.
 *
 * TODO(phase-1): implement — just delegates to startMcpServer().
 */
export async function mcpCommand(): Promise<void> {
  throw new Error("not implemented: mcpCommand");
}
