import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Request, Response } from 'express';

interface ThrottlerOptions {
  ttl: number;
  limit: number;
}

/**
 * Custom implementation of a rate limiting guard that provides:
 * - IP-based tracking by default
 * - Automatic exclusion of health check endpoints
 * - Support for @SkipThrottle decorator
 */
@Injectable()
export class AppThrottlerGuard implements CanActivate {
  constructor(
    @Inject('ThrottlerModuleOptions')
    protected readonly options: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {}

  /**
   * Determines whether the current request should be throttled.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if we should skip throttling for this route
    if (await this.shouldSkip(context)) {
      return true;
    }

    // Get request and response
    const { res } = this.getRequestResponse(context);

    // Get throttling options
    const options = this.options as ThrottlerOptions[];
    const ttl = options[0]?.ttl || 60;
    const limit = options[0]?.limit || 10;

    // Generate a unique tracker key for this request
    const key = this.generateKey(context, '');

    // Try to increment the counter for this key
    // The increment method requires 5 arguments: key, ttl, limit, blockDuration, and throttlerName
    const currentCount = await this.storageService.increment(
      key,
      ttl,
      limit,
      0,
      'default',
    );
    const current =
      typeof currentCount === 'number' ? currentCount : currentCount.totalHits;

    // Add headers to the response
    res.header('X-RateLimit-Limit', limit.toString());
    res.header(
      'X-RateLimit-Remaining',
      Math.max(0, limit - current).toString(),
    );
    res.header('X-RateLimit-Reset', ttl.toString());

    // If current count exceeds limit, reject the request
    if (current > limit) {
      res.header('Retry-After', ttl.toString());
      res.status(429).json({
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      });
      return false;
    }

    return true;
  }

  /**
   * Extracts request and response objects from the execution context.
   */
  protected getRequestResponse(context: ExecutionContext): {
    req: Request;
    res: Response;
  } {
    const http = context.switchToHttp();
    return {
      req: http.getRequest<Request>(),
      res: http.getResponse<Response>(),
    };
  }

  /**
   * Generates a unique key for rate limiting based on the request.
   * Uses the client's IP address by default.
   */
  protected generateKey(context: ExecutionContext, suffix: string): string {
    const { req } = this.getRequestResponse(context);
    return req.ip + suffix;
  }

  /**
   * Determines whether rate limiting should be skipped for this request.
   * Skips rate limiting for health check endpoints and routes with @SkipThrottle decorator.
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    // Skip rate limiting for health check endpoints
    const { req } = this.getRequestResponse(context);
    // Check if the path contains '/health'
    if (req.path.includes('/health')) {
      return true;
    }

    // Check for @SkipThrottle() decorator
    const skipThrottle = this.reflector.getAllAndOverride<boolean>(
      'skipThrottle',
      [context.getHandler(), context.getClass()],
    );

    return skipThrottle === true;
  }
}
