# 2ly - Runtime

Runtime process for [2ly](https://github.com/2ly-ai/2ly) instances. Typically used to consume 2ly as MCP Server from an agent or to execute tool calls on the edge.

## Run as MCP Server

Add the following configuration in your MCP Client. This will run an "agent" on 2ly where you'll be able to add any tools from your instance.

```json
{
  "mcpServers": {
    "2ly": {
      "command": "npx",
      "args": ["@2ly/agent-runtime"],
      "env": {
        "RUNTIME_NAME": "<GIVE_A_NAME_HERE>"
      }
    }
  }
}
```

## Run as a tool executor

Execute the following command in your terminal:

```bash
RUNTIME_NAME=<GIVE_A_NAME_HERE> npx @2ly/runtime
```

This will start a long-living node process with the ability to host MCP Servers and execute their tools from this runtime.