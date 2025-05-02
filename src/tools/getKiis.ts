import {z} from "zod";
import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {callCampaignApi} from "../utils/apiHelper.js";

const kiisSchema = z.object({
    campaign_id: z.string().describe("The unique identifier for the campaign. Can be a integer ID or string SLUG (string in all downcase)."),
});

export function registerGetKiisTool(server: McpServer) {
    server.tool(
        "get_kiis",
        "Retrieves the Key Investor Information Sheets (KIIS) for a specific campaign ID or SLUG (string in all downcase).",
        kiisSchema.shape,
        async (args) => {
            const validatedArgs = kiisSchema.parse(args);
            const result = await callCampaignApi(`/${validatedArgs.campaign_id}/kiis`);

            if (result.success) {
                const responseText = `KIIS for campaign ${validatedArgs.campaign_id}:\n${result.data}`;
                return {
                    content: [{type: "text", text: responseText}],
                };
            } else {
                return {
                    content: [{type: "text", text: `Error fetching KIIS: ${result.error}`}],
                };
            }
        }
    );
    console.error("MCP Server: Registered tool 'get_kiis'");
}
