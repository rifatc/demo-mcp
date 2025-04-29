import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import dotenv from "dotenv";

dotenv.config();

// --- Configuration ---
const BASE_API_URL = process.env.BASE_API_URL; // Base URL
const API_KEY = process.env.CAMPAIGN_API_KEY; // Optional API Key

if (!BASE_API_URL) {
    console.error("FATAL ERROR: BASE_API_URL is not defined in the environment variables.");
    process.exit(1);
}

const USER_AGENT = "demo-mcp-server/1.0";

// --- API Helper ---

interface ApiSuccessResponse {
    data: any;
}

interface ApiErrorResponse {
    error: string;
    message?: string;
}

/**
 * Helper function to call the campaign API.
 * Handles basic fetch, plaintext parsing, and error checking.
 */
async function callCampaignApi<T = string>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET', // Add other methods if needed
    body?: object
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    const url = `${BASE_API_URL}${endpoint}`;
    const headers: Record<string, string> = {
        "User-Agent": USER_AGENT,
        "Accept": "text/plain",
    };

    if (API_KEY) {
        headers["Authorization"] = `Bearer ${API_KEY}`; // Or your API's auth scheme
    }
    if (method !== 'GET' && body) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    try {
        console.error(`MCP Server: Calling API - ${method} ${url}`); // Log to stderr

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
                ? new URLSearchParams(body as Record<string, string>).toString()
                : undefined,
        });

        if (!response.ok) {
            const errorBody = `API Error: ${response.status} ${response.statusText}`;
            console.error(`MCP Server: API call failed - ${errorBody}`);
            return { success: false, error: errorBody };
        }

        // Assume successful responses return plaintext
        const data = await response.text() as T;
        console.error(`MCP Server: API call successful for ${url}`);
        return { success: true, data: data };

    } catch (error: any) {
        console.error(`MCP Server: Network or parsing error calling API for ${url}:`, error);
        return {
            success: false,
            error: `Network or processing error: ${error.message || 'Unknown error'}`,
        };
    }
}

// --- MCP Server Setup ---
const server = new McpServer({
    name: "campaign-api-server",
    version: "1.0.0",
    capabilities: {
        // Add resources or prompts here if needed later
        resources: {},
        tools: {}, // Tools will be added below
    },
});

// --- Tool Definitions ---

// 1. Get Pitch Tool
const pitchSchema = z.object({
    campaign_id: z.string().describe("The unique identifier for the campaign."),
});

server.tool(
    "get_pitch", // Tool name used by the LLM
    "Retrieves the marketing pitch associated with a specific campaign ID or SLUG.", // Description for the LLM
    pitchSchema.shape, // Input validation schema
    async (args) => { // Handler function
        const result = await callCampaignApi(`/${args.campaign_id}/pitch`);

        if (result.success) {
            const responseText = `Pitch for campaign ${args.campaign_id}:\n${result.data}`; // Adjusted for plaintext response
            return {
                content: [{ type: "text", text: responseText }],
            };
        } else {
            return {
                content: [{ type: "text", text: `Error fetching pitch: ${result.error}` }],
            };
        }
    }
);

// 2. Get KIIS Tool
const kiisSchema = z.object({
    campaign_id: z.string().describe("The unique identifier for the campaign. Can be a integer ID or string SLUG."),
});

server.tool(
    "get_kiis",
    "Retrieves the Key Investor Information Sheets (KIIS) for a specific campaign ID or SLUG.",
    kiisSchema.shape,
    async (args) => {
        const result = await callCampaignApi(`/${args.campaign_id}/kiis`);

        if (result.success) {
            const responseText = `KIIS for campaign ${args.campaign_id}:\n${result.data}`; // Adjusted for plaintext response
            return {
                content: [{ type: "text", text: responseText }],
            };
        } else {
            return {
                content: [{ type: "text", text: `Error fetching KIIS: ${result.error}` }],
            };
        }
    }
);

// 3. Get Marketing Materials Tool
const marketingMaterialsSchema = z.object({
    campaign_id: z.string().describe("The unique identifier for the campaign. Can be a integer ID or string SLUG."),
});

server.tool(
    "get_marketing_materials",
    "Retrieves the marketing materials associated with a specific campaign ID or SLUG.",
     marketingMaterialsSchema.shape,
    async (args) => {
        const result = await callCampaignApi(`/${args.campaign_id}/marketing_materials`);

        if (result.success) {
            const responseText = `Marketing Materials for campaign ${args.campaign_id}:\n${result.data}`; // Adjusted for plaintext response
            return {
                content: [{ type: "text", text: responseText }],
            };
        } else {
            return {
                content: [{ type: "text", text: `Error fetching marketing materials: ${result.error}` }],
            };
        }
    }
);

// --- Main Execution ---
async function main() {
    // Use Stdio transport for simple integration (like with Claude Desktop)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Log to stderr so it doesn't interfere with MCP communication on stdout
    console.error("Campaign API MCP Server running on stdio...");
    console.error(`Base API URL: ${BASE_API_URL}`);
    if (API_KEY) {
        console.error("Using API Key authentication.");
    } else {
        console.error("No API Key provided (running without authentication).");
    }
}

main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
});

