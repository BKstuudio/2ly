import Fastify, { FastifyInstance } from 'fastify';
import { Container } from 'inversify';
import { SecurityMiddleware, RateLimitMiddleware } from '../middleware';
import { AuthRoutes } from '../routes/auth.routes';
import { ApolloServer } from '@apollo/server';
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from '@nitra/as-integrations-fastify';
import { resolvers } from '../database/resolvers';
import { readFileSync } from 'fs';
import path from 'path';
import { JwtService } from '../services/auth/jwt.service';
import { GraphQLContext } from '../services/apollo.service';
import { MonitoringService } from '../services/monitoring.service';

// Import all the DI setup
import {
  NatsService,
  NATS_CONNECTION_OPTIONS,
  LoggerService,
  LOG_LEVEL,
  MAIN_LOGGER_NAME,
  FORWARD_STDERR,
  HEARTBAT_TTL,
  DEFAULT_HEARTBAT_TTL,
  EPHEMERAL_TTL,
  DEFAULT_EPHEMERAL_TTL,
} from '@2ly/common';
import { DGraphService, DGRAPH_URL } from '../services/dgraph.service';
import { DROP_ALL_DATA } from '../services/runtime.service';
import {
  RuntimeRepository,
  MonitoringRepository,
  WorkspaceRepository,
  UserRepository,
  SessionRepository,
  RegistryRepository,
  MCPServerRepository,
  MCPToolRepository,
  SystemRepository,
} from '../repositories';
import { JwtService as JwtServiceImport, AuthenticationService, AccountSecurityService, PasswordPolicyService } from '../services/auth';
import { GraphQLAuthMiddleware } from '../middleware';
import { MCPServerAutoConfigService, AZURE_ENDPOINT, AZURE_API_KEY, BRAVE_SEARCH_API_KEY } from '../services/mcp-auto-config.service';

export interface AppResult {
  app: FastifyInstance;
  container: Container;
}

/**
 * Creates a fresh DI container for testing
 */
function createTestContainer(): Container {
  const container = new Container();

  // Init nats service
  const natsServers = process.env.NATS_SERVERS || 'localhost:4222';
  const natsName = process.env.NATS_NAME || 'backend';
  container.bind(NATS_CONNECTION_OPTIONS).toConstantValue({
    servers: natsServers,
    name: natsName,
    reconnect: true,
    maxReconnectAttempts: -1,
    reconnectTimeWait: 1000,
  });
  container.bind(HEARTBAT_TTL).toConstantValue(process.env.HEARTBAT_TTL || DEFAULT_HEARTBAT_TTL);
  container.bind(EPHEMERAL_TTL).toConstantValue(process.env.EPHEMERAL_TTL || DEFAULT_EPHEMERAL_TTL);
  container.bind(NatsService).toSelf().inSingletonScope();

  // Init dgraph service
  container.bind(DROP_ALL_DATA).toConstantValue(process.env.DROP_ALL_DATA === 'true');
  container.bind(DGRAPH_URL).toConstantValue(process.env.DGRAPH_URL || 'localhost:8080');
  container.bind(DGraphService).toSelf().inSingletonScope();

  // Init repositories
  container.bind(RuntimeRepository).toSelf().inSingletonScope();
  container.bind(WorkspaceRepository).toSelf().inSingletonScope();
  container.bind(UserRepository).toSelf().inSingletonScope();
  container.bind(SessionRepository).toSelf().inSingletonScope();
  container.bind(RegistryRepository).toSelf().inSingletonScope();
  container.bind(MCPServerRepository).toSelf().inSingletonScope();
  container.bind(MCPToolRepository).toSelf().inSingletonScope();
  container.bind(SystemRepository).toSelf().inSingletonScope();
  container.bind(MonitoringRepository).toSelf().inSingletonScope();

  // Init authentication services
  container.bind(JwtServiceImport).toSelf().inSingletonScope();
  container.bind(AuthenticationService).toSelf().inSingletonScope();

  // Init security services
  container.bind(AccountSecurityService).toSelf().inSingletonScope();
  container.bind(PasswordPolicyService).toSelf().inSingletonScope();

  // Init middleware services
  container.bind(SecurityMiddleware).toSelf().inSingletonScope();
  container.bind(RateLimitMiddleware).toSelf().inSingletonScope();
  container.bind(GraphQLAuthMiddleware).toSelf().inSingletonScope();

  // Init routes
  container.bind(AuthRoutes).toSelf().inSingletonScope();

  // Init monitoring service
  container.bind(MonitoringService).toSelf().inSingletonScope();

  // Init MCP server auto config service
  container.bind(AZURE_ENDPOINT).toConstantValue(process.env.AZURE_ENDPOINT || 'https://models.inference.ai.azure.com');
  container.bind(AZURE_API_KEY).toConstantValue(process.env.AZURE_API_KEY || '');
  container.bind(BRAVE_SEARCH_API_KEY).toConstantValue(process.env.BRAVE_SEARCH_API_KEY || '');
  container.bind(MCPServerAutoConfigService).toSelf().inSingletonScope();

  // Init logger service
  container.bind(MAIN_LOGGER_NAME).toConstantValue('2ly-backend');
  container.bind(FORWARD_STDERR).toConstantValue(false);
  container.bind(LOG_LEVEL).toConstantValue(process.env.LOG_LEVEL || 'info');
  container.bind(LoggerService).toSelf().inSingletonScope();

  return container;
}

/**
 * Creates a Fastify application with all necessary middleware, routes, and GraphQL for testing.
 */
export async function createApp(): Promise<AppResult> {
  // Create fresh DI container
  const container = createTestContainer();

  // Create Fastify instance
  const app = Fastify({ logger: false });

  // Get services from container
  const securityMiddleware = container.get(SecurityMiddleware);
  const rateLimitMiddleware = container.get(RateLimitMiddleware);
  const authRoutes = container.get(AuthRoutes);
  const jwtService = container.get(JwtService);

  // Register middleware
  await securityMiddleware.register(app);
  await rateLimitMiddleware.register(app);

  // Register routes
  await authRoutes.register(app);

  // Create Apollo Server for GraphQL
  const schemaPath = path.join(__dirname, '../../../common/schema/apollo.schema.graphql');
  const schema = readFileSync(schemaPath, 'utf-8');
  const res = resolvers(container);

  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs: schema,
    resolvers: res,
    plugins: [
      fastifyApolloDrainPlugin(app),
    ],
    introspection: true,
  });

  await apollo.start();

  // Register GraphQL endpoint
  app.route({
    url: '/graphql',
    method: ['POST', 'GET', 'OPTIONS'],
    handler: fastifyApolloHandler(apollo, {
      context: async (request): Promise<GraphQLContext> => {
        const context: GraphQLContext = {
          req: {
            ip: request.ip,
            headers: request.headers,
          },
        };

        // Extract and verify JWT token
        const authHeader = request.headers.authorization;
        if (authHeader && typeof authHeader === 'string') {
          try {
            const token = jwtService.extractTokenFromHeader(authHeader);
            if (token) {
              const payload = await jwtService.verifyToken(token, 'access');
              if (payload.valid && payload.payload) {
                context.user = {
                  userId: payload.payload.userId,
                  email: payload.payload.email,
                  workspaceId: payload.payload.workspaceId,
                  role: payload.payload.role,
                };
              }
            }
          } catch (error) {
            // Log authentication errors but don't block requests
            console.warn(`Authentication context error: ${(error as Error).message}`);
          }
        }

        return context;
      },
    }),
    config: {
      cors: {
        origin: '*',
      },
    },
  });

  return {
    app,
    container,
  };
}