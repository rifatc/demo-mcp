import {z} from "zod";
import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js"; // Use type import
import {callCampaignApi} from "../utils/apiHelper.js"; // Import the helper

const pitchSchema = z.object({
    campaign_id: z.string().describe("The unique identifier for the campaign."),
});

export function registerGetPitchTool(server: McpServer) {
    server.tool(
        "get_pitch",
        "Retrieves the marketing pitch associated with a specific campaign ID or SLUG.",
        pitchSchema.shape,
        async (args) => {
            // Validate args using the schema (McpServer might do this already, but explicit is good)
            const validatedArgs = pitchSchema.parse(args); // Throws if invalid

            const result = await callCampaignApi(`/${validatedArgs.campaign_id}/pitch`);

            if (result.success) {
                const responseText = `Pitch for campaign ${validatedArgs.campaign_id}:\n${result.data}`;
                return {
                    content: [{type: "text", text: responseText}],
                };
            } else {
                return {
                    content: [{type: "text", text: `Error fetching pitch: ${result.error}`}],
                };
            }
        }
    );
    console.error("MCP Server: Registered tool 'get_pitch'"); // Log registration
}
