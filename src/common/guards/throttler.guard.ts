import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  constructor(
    protected readonly options: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * Custom implementation of the ThrottlerGuard that can be extended
   * to add custom behavior such as different rate limits for different routes,
   * or to exclude certain routes from rate limiting.
   */
  protected override getRequestResponse(context: ExecutionContext): {
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
   * Extracts the identifier for rate limiting from the request.
   * By default, uses the client's IP address.
   */
  protected override generateKey(
    context: ExecutionContext,
    suffix: string,
  ): string {
    const { req } = this.getRequestResponse(context);
    // Use IP address as the tracker by default
    return req.ip + suffix;

    // Alternatively, you can use a combination of IP and route
    // return `${req.ip}-${req.path}${suffix}`;

    // Or for authenticated users, you can use the user ID
    // if (req.user && req.user.id) {
    //   return `${req.user.id}${suffix}`;
    // }
    // return req.ip + suffix;
  }

  /**
   * Optional method to exclude specific routes from rate limiting.
   * Override this method to implement custom exclusion logic.
   */
  protected override async shouldSkip(
    context: ExecutionContext,
  ): Promise<boolean> {
    // Example: Skip rate limiting for health check endpoints
    const { req } = this.getRequestResponse(context);
    if (req.path.includes('/health')) {
      return true;
    }

    // Check for @SkipThrottle() decorator
    return super.shouldSkip(context);
  }
}
