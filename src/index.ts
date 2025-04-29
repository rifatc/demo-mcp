import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
// Removed z import as it's now only used within tools
import dotenv from "dotenv";

// Import tool registration functions
import {registerGetPitchTool} from "./tools/getPitch.js";
import {registerGetKiisTool} from "./tools/getKiis.js";
import {registerGetMarketingMaterialsTool} from "./tools/getMarketingMaterials.js";
// Removed callCampaignApi import as it's now only used within tools (via api.ts)

dotenv.config();

// --- Configuration ---
// Keep configuration checks here at the main entry point
const BASE_API_URL = process.env.BASE_API_URL;
const API_KEY = process.env.CAMPAIGN_API_KEY;

if (!BASE_API_URL) {
    console.error("FATAL ERROR: BASE_API_URL is not defined in the environment variables.");
    process.exit(1); // Exit here if essential config is missing
}

// --- MCP Server Setup ---
const server = new McpServer({
    name: "campaign-api-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {}, // Tools will be registered below
    },
});

// --- Register Tools ---
// Call the functions imported from the tools directory
registerGetPitchTool(server);
registerGetKiisTool(server);
registerGetMarketingMaterialsTool(server);

// --- Main Execution ---
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Campaign API MCP Server running on stdio...");
    console.error(`Base API URL: ${BASE_API_URL}`);
    if (API_KEY) {
        console.error("Using API Key authentication.");
    } else {
        console.error("No API Key provided (running without authentication).");
    }
    // Add a message indicating tools are ready
    console.error("Tools registered and server ready.");
}

main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
});
