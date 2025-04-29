// src/utils/api.ts
import dotenv from "dotenv";

dotenv.config(); // Ensure env vars are loaded if this module is imported first

// --- Configuration ---
const BASE_API_URL = process.env.BASE_API_URL; // Base URL
const API_KEY = process.env.CAMPAIGN_API_KEY; // Optional API Key

if (!BASE_API_URL) {
    // It's better to handle this check where the function is called or at app startup
    // but we'll keep a check here for robustness if this module is used elsewhere.
    console.error("FATAL ERROR: BASE_API_URL is not defined. Ensure it's set before calling API functions.");
    // Avoid process.exit(1) in a potentially reusable module. Throw an error instead.
    // throw new Error("BASE_API_URL is not defined in the environment variables.");
}

const USER_AGENT = "demo-mcp-server/1.0"; // Consider making this configurable if needed

/**
 * Helper function to call the campaign API.
 * Handles basic fetch, plaintext parsing, and error checking.
 */
export async function callCampaignApi<T = string>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET', // Add other methods if needed
    body?: object
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    // Check BASE_API_URL at the point of use
    if (!BASE_API_URL) {
        const errorMsg = "API call failed: BASE_API_URL is not configured.";
        console.error(`MCP Server: ${errorMsg}`);
        return {success: false, error: errorMsg};
    }

    const url = `${BASE_API_URL}${endpoint}`;
    const headers: Record<string, string> = {
        "User-Agent": USER_AGENT,
        "Accept": "text/plain", // Assuming plaintext is always expected
    };

    if (API_KEY) {
        headers["Authorization"] = `Bearer ${API_KEY}`; // Or your API's auth scheme
    }
    if (method !== 'GET' && body) {
        // Ensure Content-Type is set only when there's a body for non-GET requests
        headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    try {
        console.error(`MCP Server: Calling API - ${method} ${url}`); // Log to stderr

        const response = await fetch(url, {
            method: method,
            headers: headers,
            // Only include body if method is not GET and body exists
            body: method !== 'GET' && body
                ? new URLSearchParams(body as Record<string, string>).toString()
                : undefined,
        });

        if (!response.ok) {
            // Try to get more specific error details if possible
            let errorDetails = `${response.status} ${response.statusText}`;
            try {
                // Attempt to read error body, but don't fail if it's not text/json
                const errorText = await response.text();
                if (errorText) {
                    errorDetails += ` - ${errorText.substring(0, 100)}`; // Limit length
                }
            } catch (e) { /* Ignore read error */
            }

            const errorBody = `API Error: ${errorDetails}`;
            console.error(`MCP Server: API call failed - ${errorBody}`);
            return {success: false, error: errorBody};
        }

        // Assume successful responses return plaintext
        const data = await response.text() as T; // Cast might be unsafe if API can return non-text
        console.error(`MCP Server: API call successful for ${url}`);
        return {success: true, data: data};

    } catch (error: any) {
        console.error(`MCP Server: Network or parsing error calling API for ${url}:`, error);
        // Provide a more structured error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Network or processing error: ${errorMessage}`,
        };
    }
}
