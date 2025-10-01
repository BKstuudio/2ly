import asyncio
from langchain_2ly import MCPAdapter

async def main():
    tools = await MCPAdapter("Hello world").tools();
    for tool in tools:
        print(tool.name)

if __name__ == "__main__":
    asyncio.run(main())