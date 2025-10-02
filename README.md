# 2LY - AI Tools Platform

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-required-blue.svg)](https://docker.com/)
[![Development Status](https://img.shields.io/badge/status-beta-orange.svg)](https://github.com/AlpinAI/2ly/releases)

**One Platform. Any agent. All tools.**

2LY is an open source platform for AI Tools connectivity within or across any agent framework or environment.
It provides a central tools registry with embedded runtimes, enabling unified management and observability across all agent-to-tool interactions. By decoupling tool infrastructure from agent logic, 2LY eliminates fragmented integrations and gives users control over their AI tool ecosystem. The platform supports interoperable protocols including Model Context Protocol (MCP), with REST APIs and custom functions coming soon.

## Quick Start

### Prerequisites
- Node.js (v18+), Docker & Docker Compose

### Installation

```bash
git clone https://github.com/AlpinAI/2ly.git
cd 2ly
npm run start
```

Access dashboard at **http://localhost:8888**

### Connect Your First Agent
1. Initialize your instance
2. Connect an agent or create an empty one
3. Browse available tools in the MCP server catalog or add your own
4. Assign tools to your agent
5. Trigger your agent - it has now access to the tools
5. Monitor agent-to-tool interactions and observability insights

## Architecture

2LY acts as both a proxy and intelligence layer between your agents and tools:

```
Your Agent → 2LY Platform → Tool Ecosystem
(LangChain)   (Proxy +       (MCP Servers)
(Langflow)     Intelligence)  (REST APIs)
(n8n)         (Observability) (Functions)
(Custom)
```

**Core Components:**
- **Runtime** - Isolated execution environments for agents and tools with performance monitoring
- **Protocol Gateway** - MCP-to-HTTP translation with request/response tracking
- **Agent Connectors** - Framework-specific integration libraries
- **Intelligence Engine** - Usage analytics, cost optimization, and relationship mapping
- **Management Dashboard** - Tool deployment, monitoring, and observability insights


## Universal Tool Ecosystem

2LY supports any tool type - no vendor lock-in, no proprietary limitations.

### MCP Servers (Available Now)
- **Native Anthropic Registry Integration** - 50+ community servers (filesystem, GitHub, database, and more) with full observability
- **Custom MCP Servers** - Deploy your proprietary servers with complete analytics and monitoring

### REST APIs (Coming Q4 2025)
- **Direct API Integration** - Wrap any HTTP endpoint with authentication and usage tracking
- **Response Transformation** - Standardized outputs with performance metrics

### Custom Functions (Coming Q4 2025)
- **JavaScript/TypeScript Functions** - Deploy custom business logic with execution analytics
- **Integration Adapters** - Connect any system with relationship mapping and cost tracking

## Links

- [Development Instructions and Guidelines](/dev/README.md)
- [Product Documentation](https://docs.2ly.ai)
- [Product Website](https://2ly.ai)

## License

Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

--------------------------------------------------------
**Ready to take control of your AI tool ecosystem?** 

⭐ [Star this repo](https://github.com/AlpinAI/2ly/stargazers) • 🍴 [Fork for your projects](https://github.com/AlpinAI/2ly/fork) • 💬 [Join our Discord community](https://discord.gg/2ly-ai)
