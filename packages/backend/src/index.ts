import dotenv from 'dotenv';
import { container, start } from './di/container';
import { MainService } from './services/backend.main.service';
import 'reflect-metadata';
dotenv.config();
start();

const mainService = container.get(MainService);
mainService.start();

// REFERENCES
// as-integration-fastify is using a fork since: https://github.com/apollo-server-integrations/apollo-server-integration-fastify/issues/296
// Adding authorization with JWT, example of context : https://www.npmjs.com/package/@nitra/as-integrations-fastify
// Subscription pubsub lib: https://www.npmjs.com/package/graphql-subscriptions
