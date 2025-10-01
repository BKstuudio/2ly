---
description: The official MCP registry is regularly changing its API format and it breaks this app. This command is designed to update the code to match the API changes and repair any introduced breaking changes
allowed-tools: Bash(npm run:*), Bash(docker:*), TodoWrite
---

1. Start by running

```bash
cd packages/frontend codegen:mcp-registry
```

Which is updating the typings based on https://registry.modelcontextprotocol.io/openapi.yaml

2. Analyze the changes from previous working state

Take time to understand the changes of API and the impact on this application. The API is mainly consumed in packages/frontend/src/services/mcpRegistry.service.ts

3. Fix the code to align with new API

4. Run `/code-quality frontend allow-non-empty-git´ command to ensure that you didn't introduce typing, linting or testing issues.