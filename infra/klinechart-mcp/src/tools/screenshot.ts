import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { screenshot } from "../browser.js";

export function registerScreenshot(server: McpServer): void {
  server.tool(
    "screenshot",
    "Take a screenshot of the current chart and return it as a base64-encoded PNG. Call open_chart first.",
    {},
    async () => {
      const base64 = await screenshot();
      return {
        content: [{ type: "image", data: base64, mimeType: "image/png" }],
      };
    }
  );
}
