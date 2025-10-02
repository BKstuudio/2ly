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

## Key features

- **Tool Registry** - Centralized catalog of MCP servers, APIs, and custom functions with version management
- **Agents** - Discover and manage all your agents across frameworks like LangChain, Langflow, n8n, and custom implementations
- **Playground** - Integrated environment to test and debug tools before connecting them to agents
- **Monitoring** - Complete visibility into agent-to-tool transactions with detailed logs, analytics, and compliance tracking
- **Deployment** - Flexible runtime deployment across local, remote, and edge environments with automatic scaling

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
1. Runtimes - Isolated execution environments for tools with flexible deployment options
2. Dgraph - High-performance graph database for tool registry and relationship mapping
3. NATS - Message bus for real-time communication and event streaming
4. Backend - Logic processing and tool orchestration
5. Frontend - Management dashboard for configuration, monitoring, and analytics

## Roadmap
2LY is evolving rapidly with new features and capabilities being added regularly. Have an idea or need something specific? We'd love to hear from you - submit a feature request!


## Links

- [Development Instructions and Guidelines](/dev/README.md)
- [Product Documentation](https://docs.2ly.ai)
- [Product Website](https://2ly.ai)

## License

Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

--------------------------------------------------------
**Ready to take control of your AI tool ecosystem?** 

⭐ [Star this repo](https://github.com/AlpinAI/2ly/stargazers) • 🍴 [Fork for your projects](https://github.com/AlpinAI/2ly/fork) • 💬 [Join our Discord community](https://discord.gg/2ly-ai)
