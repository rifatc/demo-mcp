import {z} from "zod";
import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {callCampaignApi} from "../utils/apiHelper.js";

const marketingMaterialsSchema = z.object({
    campaign_id: z.string().describe("The unique identifier for the campaign. Can be a integer ID or string SLUG (string in all downcase)."),
});

export function registerGetMarketingMaterialsTool(server: McpServer) {
    server.tool(
        "get_marketing_materials",
        "Retrieves the marketing materials associated with a specific campaign ID or SLUG (string in all downcase).",
        marketingMaterialsSchema.shape,
        async (args) => {
            const validatedArgs = marketingMaterialsSchema.parse(args);
            const result = await callCampaignApi(`/${validatedArgs.campaign_id}/marketing_materials`);

            if (result.success) {
                const responseText = `Marketing Materials for campaign ${validatedArgs.campaign_id}:\n${result.data}`;
                return {
                    content: [{type: "text", text: responseText}],
                };
            } else {
                return {
                    content: [{type: "text", text: `Error fetching marketing materials: ${result.error}`}],
                };
            }
        }
    );
    console.error("MCP Server: Registered tool 'get_marketing_materials'");
}
