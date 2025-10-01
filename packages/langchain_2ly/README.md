# langchain_2ly

2ly python module providing helpers to quickly connect [2ly](https://github.com/2ly-ai/2ly) to your agents in Python.

# Usage

Install the module

```bash
pip install langchain_2ly
```

Connects your LangGraph agent:

```python
# Import MCPAdapter
from langchain_2ly import MCPAdapter
mcp = MCPAdapter("my-runtime")
tools = await mcp.get_langchain_tools()
agent = create_react_agent(llm, tools)
await mcp.stop()
```

Under the hood our connector leverages [Langchain MCP adapters](https://github.com/langchain-ai/langchain-mcp-adapters). You can also use our variant which is strictly based on the [Official MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) (see [Using MCP without Langchain MCP Adapter](#using-mcp-without-langchain-mcp-adapter)).

## MCPAdapter lifecycle

MCP Adapter will start an MCP Server lazily when you first call `get_langchain_tools()` or when the agent call a given tool. In practice the call to retrieve the list of tools must always come first.

Since this is an async task, we provide a way to instantiate MCPAdapter with `async` and thus it will automatically stop itself when the agent is done.

```python
async def main():
    async with MCPAdapter("My agent name") as mcp:
        tools = await mcp.get_langchain_tools()
        agent = create_react_agent(llm, tools)
        agent_response = await agent.ainvoke() # as usual

if __name__ == "__main__":
    asyncio.run(main())
```

# Using MCP without Langchain MCP Adapter

Simply replace `MCPAdapter` with `MCPClient`. The API is identical.

```python
```python
async def main():
    async with MCPClient("My agent name") as mcp:
        tools = await mcp.get_langchain_tools()
        agent = create_react_agent(llm, tools)
        agent_response = await agent.ainvoke() # as usual

if __name__ == "__main__":
    asyncio.run(main())
```

## Usage examples

* [examples/list_tools.py](examples/list_tools.py): list tools available for a given 2ly agent
* [examples/langgraph.py](examples/langgraph.py): connect 2ly to a LangGraph agent
* [examples/langgraph_without_adapter.py](examples/langgraph_without_adapter.py): another LangGraph example but without Langchain adapter

### Options

Both variants accept optional configuration to control how the MCP runtime is started via `npx` and how the client behaves:

```python
from langchain_2ly import MCPAdapter, MCPClient

options = {
  "workspace": "my-workspace-id",           # forwarded to runtime as WORKSPACE_ID
  "nats_servers": "nats://localhost:4222",  # NATS URL used by runtime
  "version": "latest",                      # @2ly/runtime version for npx
  "startup_timeout_seconds": 20.0,            # wait for initialize()
  "log_level": "info",                       # forwarded to runtime as LOG_LEVEL
}

mcp = MCPAdapter("my-runtime", options)
# or
mcp = MCPClient("my-runtime", options)
```

# Development

## Prepare your venv

```bash
cd packages/langchain_2ly
python3.11 -m venv .venv # any version python3.10+ will do
source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[all]"
```

## Execute tests

```bash
pytest
```

## Build locally

```bash
python -m build
```

## Test local installation

```bash
# update the filename to the build version
# update the filename to the build version
pip install dist/langchain_2ly-0.0.1-py3-none-any.whl --force-reinstall
```

## Run the examples

```bash
python examples/list_tools.py
python examples/langgraph_agent.py
python examples/langgraph_without_adapter.py
```