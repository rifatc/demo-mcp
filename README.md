# Demo MCP

## Installation and Build Instructions

1. Clone the repository:
   ```bash
   git clone git@github.com:rifatc/demo-mcp.git
   cd demo-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration Instructions
As the MCP client we are using Claude desktop application. But you can use any other MCP client as well.
To configure the application, update the `claude_desktop_config.json` file located at:

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Add or update the configuration with the following content:

```json
{
    "mcpServers": {
        "r-marvin": {
            "command": "node",
            "args": [
                "absolute/path/to/demo-mcp/build/index.js"
            ],
            "env": {
                "BASE_API_URL": "<BASE_API_URL>"
            }
        }
    }
}
```
<img width="1136" alt="image" src="https://github.com/user-attachments/assets/e7bbf0d4-e5c5-447a-81c6-39f3ee469ff3" />


Ensure the file is saved after making the changes.

## Exposed Tools

The Demo MCP exposes the following tools:

1. **get_pitch**  
   - **Description**: Retrieves the marketing pitch associated with a specific campaign ID or SLUG in markdown format.  
   - **Input Schema**:  
     ```json
     {
         "campaign_id": "string"
     }
     ```

2. **get_kiis**  
   - **Description**: Retrieves the Key Investor Information Sheets (KIIS) for a specific campaign ID or SLUG in markdown format.  
   - **Input Schema**:  
     ```json
     {
         "campaign_id": "string"
     }
     ```

3. **get_marketing_materials**  
   - **Description**: Retrieves the marketing materials associated with a specific campaign ID or SLUG in markdown format.  
   - **Input Schema**:  
     ```json
     {
         "campaign_id": "string"
     }
     ```

Refer to the source code for detailed implementation and usage examples.

`
