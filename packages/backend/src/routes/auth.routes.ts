import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { AuthenticationService } from '../services/auth/auth.service';
import { PasswordPolicyService } from '../services/auth/password-policy.service';
import pino from 'pino';
import { LoggerService } from '@2ly/common';

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  error?: string;
}

/**
 * Simplified REST API routes for authentication services.
 * Basic health checks and token validation for POC.
 *
 * TODO: Future improvements could include:
 * - Comprehensive security status endpoints
 * - Advanced audit event querying
 * - Password generation and validation endpoints
 * - Account management endpoints
 * - Session management endpoints
 * - Multi-factor authentication endpoints
 * - Social login endpoints
 */
@injectable()
export class AuthRoutes {
  private startTime = Date.now();

  private logger: pino.Logger;

  constructor(
    @inject(LoggerService) private readonly loggerService: LoggerService,
    @inject(AuthenticationService) private readonly authService: AuthenticationService,
    @inject(PasswordPolicyService) private readonly passwordPolicyService: PasswordPolicyService
  ) {
    this.logger = this.loggerService.getLogger('auth-routes');
  }

  /**
   * Register simplified authentication routes.
   */
  async register(fastify: FastifyInstance): Promise<void> {
    // Simple health check
    fastify.get('/auth/health', {
      schema: {
        description: 'Authentication service health check',
        tags: ['authentication', 'health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              uptime: { type: 'number' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    }, this.healthCheck.bind(this));

    // Token validation endpoint
    fastify.post('/auth/validate-token', {
      schema: {
        description: 'Validate JWT access token',
        tags: ['authentication', 'validation'],
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    }, this.validateToken.bind(this));

    // Simple password validation endpoint
    fastify.post('/auth/validate-password', {
      schema: {
        description: 'Validate password against policy',
        tags: ['authentication', 'password'],
        body: {
          type: 'object',
          properties: {
            password: { type: 'string' },
          },
        },
      },
    }, this.validatePassword.bind(this));
  }

  /**
   * Simple health check handler.
   */
  private async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    const uptime = Date.now() - this.startTime;

    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');

    return {
      status: 'healthy',
      uptime,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Token validation handler.
   */
  private async validateToken(
    request: FastifyRequest<{ Body: TokenValidationRequest }>,
    reply: FastifyReply
  ): Promise<TokenValidationResponse | void> {
    const { token } = request.body || {};

    if (!token || token.trim() === '') {
      reply.status(400);
      reply.header('content-type', 'application/json');
      return reply.send(JSON.stringify({
        valid: false,
        error: 'Token is required',
      }));
    }

    try {
      const payload = await this.authService.verifyAccessToken(token);

      if (!payload) {
        return {
          valid: false,
          error: 'Token is invalid or expired',
        };
      }

      return {
        valid: true,
      };

    } catch (error) {
      this.logger.error(`Token validation failed: ${error}`);
      return {
        valid: false,
        error: 'Token validation failed',
      };
    }
  }

  /**
   * Password validation handler.
   */
  private async validatePassword(
    request: FastifyRequest<{ Body: { password: string } }>,
    reply: FastifyReply
  ) {
    const { password } = request.body;

    if (!password) {
      return reply.status(400).send({
        isValid: false,
        errors: ['Password is required'],
      });
    }

    const result = this.passwordPolicyService.validatePassword(password);

    return {
      isValid: result.isValid,
      errors: result.errors,
    };
  }
}