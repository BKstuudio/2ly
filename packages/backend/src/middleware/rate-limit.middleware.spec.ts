import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { RateLimitMiddleware } from './rate-limit.middleware';

describe('RateLimitMiddleware', () => {
  let fastify: FastifyInstance;
  let rateLimitMiddleware: RateLimitMiddleware;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    rateLimitMiddleware = new RateLimitMiddleware();
  });

  afterEach(async () => {
    if (fastify) {
      await fastify.close();
    }
  });

  describe('Simple Rate Limiting', () => {
    it('should register rate limiting middleware', async () => {
      await rateLimitMiddleware.register(fastify);

      // Add a test route
      fastify.get('/test', async () => ({ message: 'test' }));

      await fastify.ready();

      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
      });

      expect(response.statusCode).toBe(200);
    });

    it('should include rate limit headers', async () => {
      await rateLimitMiddleware.register(fastify);

      fastify.get('/test', async () => ({ message: 'test' }));

      await fastify.ready();

      const response = await fastify.inject({
        method: 'GET',
        url: '/test',
      });

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });

    it('should return proper error response when rate limit is exceeded', async () => {
      // Set very low rate limit for testing
      process.env.RATE_LIMIT_MAX = '1';
      process.env.RATE_LIMIT_WINDOW = '60000';

      await rateLimitMiddleware.register(fastify);

      fastify.get('/test', async () => ({ message: 'test' }));

      await fastify.ready();

      // First request should succeed
      const response1 = await fastify.inject({
        method: 'GET',
        url: '/test',
      });
      expect(response1.statusCode).toBe(200);

      // Second request should be rate limited
      const response2 = await fastify.inject({
        method: 'GET',
        url: '/test',
      });
      expect(response2.statusCode).toBe(429);

      const body = JSON.parse(response2.payload);
      expect(body.error).toBe('Too Many Requests');
      expect(body.message).toBe('Rate limit exceeded. Please try again later.');

      // Clean up
      delete process.env.RATE_LIMIT_MAX;
      delete process.env.RATE_LIMIT_WINDOW;
    });
  });
});