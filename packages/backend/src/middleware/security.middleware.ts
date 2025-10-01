import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { injectable } from 'inversify';

/**
 * Basic security middleware for POC.
 * Simple CORS and basic security headers only.
 *
 * TODO: Future security improvements could include:
 * - Content Security Policy (CSP) configuration
 * - HTTP Strict Transport Security (HSTS)
 * - Advanced XSS protection
 * - Request size limits
 * - Security logging and monitoring
 * - Rate limiting per security context
 * - IP whitelisting/blacklisting
 * - DDoS protection
 */
@injectable()
export class SecurityMiddleware {
  async register(fastify: FastifyInstance): Promise<void> {
    // Basic CORS setup
    const ENV_CORS_ORIGINS = process.env.CORS_ORIGINS ?? '';
    const allowedOrigins = ENV_CORS_ORIGINS
      .split(',')
      .map(origin => {
        const trimmedOrigin = origin.trim();
        // If the origin looks like a regexp (starts and ends with /), treat as RegExp
        if (
          trimmedOrigin.startsWith('/') &&
          trimmedOrigin.lastIndexOf('/') > 0 &&
          trimmedOrigin.length > 2
        ) {
          const lastSlash = trimmedOrigin.lastIndexOf('/');
          const pattern = trimmedOrigin.slice(1, lastSlash);
          const flags = trimmedOrigin.slice(lastSlash + 1);
          try {
            return new RegExp(pattern, flags);
          } catch {
            // If invalid regexp, fallback to string
            return trimmedOrigin;
          }
        }
        return trimmedOrigin;
      });
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:8888', 'http://localhost:3000');
    }

    await fastify.register(cors, {
      origin: allowedOrigins,
      credentials: true
    });

    // Basic security headers
    await fastify.register(helmet, {
      // Keep it simple for POC
      contentSecurityPolicy: false, // Disable CSP for now
      hsts: false // Disable HSTS for development
    });
  }
}