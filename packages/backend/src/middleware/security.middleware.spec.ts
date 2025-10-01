import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { SecurityMiddleware } from './security.middleware';

describe('SecurityMiddleware', () => {
  let fastify: FastifyInstance;
  let securityMiddleware: SecurityMiddleware;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    securityMiddleware = new SecurityMiddleware();
  });

  afterEach(async () => {
    if (fastify) {
      await fastify.close();
    }
  });

  describe('Basic Security Configuration', () => {
    it('should register security middleware', async () => {
      await securityMiddleware.register(fastify);

      // Add a test route
      fastify.get('/test', async () => ({ message: 'test' }));

      await fastify.ready();

      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
      });

      expect(response.statusCode).toBe(200);
    });

    it('should include basic security headers', async () => {
      await securityMiddleware.register(fastify);

      fastify.get('/test', async () => ({ message: 'test' }));

      await fastify.ready();

      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
      });

      // Should have some Helmet security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should handle CORS for development origins', async () => {
      await securityMiddleware.register(fastify);

      fastify.get('/test', async () => ({ message: 'test' }));

      await fastify.ready();

      const response = await fastify.inject({
        method: 'OPTIONS',
        url: '/test',
        headers: {
          'origin': 'http://localhost:8888',
          'access-control-request-method': 'GET',
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});