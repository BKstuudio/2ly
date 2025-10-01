import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { injectable } from 'inversify';

/**
 * Simple rate limiting middleware for the entire application.
 *
 * TODO: Future improvements could include:
 * - Different limits for different endpoint types
 * - User-based rate limiting
 * - IP whitelisting
 * - More sophisticated rate limiting algorithms
 */
@injectable()
export class RateLimitMiddleware {
  async register(fastify: FastifyInstance): Promise<void> {
    await fastify.register(rateLimit, {
      // 100 requests per minute per IP - generous for POC
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 minute
      errorResponseBuilder: () => ({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        statusCode: 429
      })
    });
  }
}