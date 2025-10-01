# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**2ly** is an AI tool management application built as a TypeScript monorepo with microservices architecture. It connects MCP (Model Context Protocol) Tools to Agent runtimes in a distributed way using:

- **Database**: Dgraph (graph database) via GraphQL
- **Message Bus**: NATS with JetStream
- **Backend**: Node.js with Fastify + Apollo GraphQL
- **Frontend**: React + Vite + Tailwind CSS
- **Runtime**: Distributed NodeJS processes for edge execution

## Development Commands

### Primary Commands
- `npm run start:dev` - Start development environment (Docker Compose with NATS, Dgraph)
- `npm run dev:backend` - Start backend development server (localhost:3000)
- `npm run dev:frontend` - Start frontend development server (localhost:8888)
- `npm run dev:tool-runtime` - Start runtime processes locally

### Build & Test
- `npm run build` - Build all packages
- `npm run test` - Run all tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run lint` - Lint all packages
- `npm run format` - Format with Prettier
- `npm run typecheck` - Check typescript types

### Code Generation
- `npm run codegen` - Generate GraphQL types from schema

## Monorepo Architecture

### Package Structure
- `packages/backend/` - Fastify + Apollo GraphQL server
- `packages/frontend/` - React application with Vite
- `packages/runtime/` - Distributed runtime processes (published to npm)
- `packages/common/` - Shared GraphQL schemas, types, and utilities
- `packages/doc/` - Documentation (Next.js)
- `packages/twoly/` - Python package for LangChain integration

### Dependency Injection
Each package uses Inversify containers in `/di/container.ts` for dependency injection.

### Backend Patterns
```
packages/backend/src/
├── database/         # Database operations and migrations
├── repositories/     # Data access layer
├── services/        # Business logic
├── middleware/      # Fastify middleware
└── helpers/         # Utility functions
```

### Frontend Patterns
```
packages/frontend/src/
├── components/      # Reusable UI components
├── pages/          # Route components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── services/       # API services
└── graphql/        # GraphQL queries/mutations
```

## Testing Framework

- **Framework**: Vitest (Jest-compatible)
- **Test Files**: `*.spec.ts`, `*.test.ts`, `*.integration.spec.ts`
- **Coverage**: v8 provider with HTML/LCOV reports
- **Single Test**: `npm run test -- packages/backend/src/path/to/file.spec.ts`

## Technology Stack

### Backend
- **Fastify** with Apollo Server integration
- **JWT + Argon2** for authentication (in development)
- **Pino** for structured logging
- **TypeScript** with strict configuration

### Frontend
- **React 18** with TypeScript
- **Vite 7** for build tooling
- **Tailwind CSS** with custom design system
- **Apollo Client** for GraphQL state management
- **Framer Motion** for animations

### Runtime
- **MCP SDK** (`@modelcontextprotocol/sdk`) for tool integration
- **NATS** messaging with backend
- **Multiple transports**: STREAM, STDIO, SSE

## Development Environment

### Local Services (via Docker Compose)
- **Dgraph Ratel**: http://localhost:8000 (Database UI)
- **NATS Dashboard**: http://localhost:8001 (Message bus monitoring)
- **Backend GraphQL**: http://localhost:3000/graphql
- **Frontend**: http://localhost:8888

### GraphQL Schema
- **Core Types**: System, Workspace, User, MCPServer, MCPTool, Runtime
- **Schemas**: `packages/common/src/apollo.schema.graphql` and `dgraph.schema.graphql`

## Code Quality Standards

- **ESLint**: TypeScript strict mode, no `any` types
- **Prettier**: Single quotes, trailing commas, 120 char width
- **Type Safety**: Strict TypeScript configuration across all packages
- **Path Mapping**: `@2ly/common`, `@2ly/backend`, etc. for cross-package imports

## Current Development Focus

The project is actively implementing a comprehensive authentication system with JWT tokens, refresh token rotation, and security middleware. The `login_kiro` branch contains ongoing authentication work.