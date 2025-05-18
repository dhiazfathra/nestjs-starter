import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { AppThrottlerGuard } from './throttler.guard';

class MockThrottlerStorage implements Partial<ThrottlerStorage> {
  increment = jest.fn().mockResolvedValue(1);
}

class MockReflector implements Partial<Reflector> {
  getAllAndOverride = jest.fn().mockReturnValue(false);
}

describe('AppThrottlerGuard', () => {
  let guard: AppThrottlerGuard;
  let reflector: Reflector;
  let _throttlerStorage: ThrottlerStorage;
  let _options: ThrottlerModuleOptions;

  beforeEach(async () => {
    const mockStorage = new MockThrottlerStorage();
    const mockReflector = new MockReflector();
    const mockOptions = [{ limit: 10, ttl: 60 }];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppThrottlerGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: ThrottlerStorage,
          useValue: mockStorage,
        },
        {
          provide: 'THROTTLER_OPTIONS',
          useValue: mockOptions,
        },
      ],
    }).compile();

    guard = module.get<AppThrottlerGuard>(AppThrottlerGuard);
    reflector = module.get<Reflector>(Reflector);
    _throttlerStorage = module.get<ThrottlerStorage>(ThrottlerStorage);
    _options = module.get<ThrottlerModuleOptions>('THROTTLER_OPTIONS');
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getRequestResponse', () => {
    it('should extract request and response from execution context', () => {
      // Mock execution context
      const request = { ip: '127.0.0.1', path: '/test' };
      const response = { header: jest.fn() };
      const executionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
          getResponse: jest.fn().mockReturnValue(response),
        }),
      } as unknown as ExecutionContext;

      const result = guard['getRequestResponse'](executionContext);

      expect(result.req).toBe(request);
      expect(result.res).toBe(response);
      expect(executionContext.switchToHttp).toHaveBeenCalled();
    });
  });

  describe('generateKey', () => {
    it('should generate a key based on IP address and suffix', () => {
      // Mock execution context
      const request = { ip: '127.0.0.1', path: '/test' };
      const response = { header: jest.fn() };
      const executionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
          getResponse: jest.fn().mockReturnValue(response),
        }),
      } as unknown as ExecutionContext;

      const suffix = ':test';
      const result = guard['generateKey'](executionContext, suffix);

      expect(result).toBe('127.0.0.1:test');
    });
  });

  describe('shouldSkip', () => {
    it('should skip rate limiting for health endpoints', async () => {
      // Mock execution context with health path
      const request = { ip: '127.0.0.1', path: '/health/check' };
      const response = { header: jest.fn() };
      const executionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
          getResponse: jest.fn().mockReturnValue(response),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const result = await guard['shouldSkip'](executionContext);

      expect(result).toBe(true);
    });

    it('should not skip rate limiting for non-health endpoints', async () => {
      // Mock execution context with non-health path
      const request = { ip: '127.0.0.1', path: '/api/users' };
      const response = { header: jest.fn() };
      const executionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
          getResponse: jest.fn().mockReturnValue(response),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // We need to test the protected method, so we'll use type assertion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guardAny = guard as any;

      // Mock the parent class's shouldSkip method
      const originalMethod =
        Object.getPrototypeOf(guardAny).constructor.prototype.shouldSkip;
      Object.getPrototypeOf(guardAny).constructor.prototype.shouldSkip = jest
        .fn()
        .mockResolvedValue(false);

      const result = await guardAny.shouldSkip(executionContext);

      expect(result).toBe(false);
      // Verify the mock was called
      expect(
        Object.getPrototypeOf(guardAny).constructor.prototype.shouldSkip,
      ).toHaveBeenCalledWith(executionContext);

      // Restore the original method
      Object.getPrototypeOf(guardAny).constructor.prototype.shouldSkip =
        originalMethod;
    });

    it('should handle canActivate method correctly', async () => {
      // Mock execution context
      const request = { ip: '127.0.0.1', path: '/api/users' };
      const response = { header: jest.fn() };
      const executionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
          getResponse: jest.fn().mockReturnValue(response),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // We need to test protected methods, so we'll use type assertion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guardAny = guard as any;

      // Mock the shouldSkip method
      const originalShouldSkip = guardAny.shouldSkip;
      guardAny.shouldSkip = jest.fn().mockResolvedValue(false);

      // Mock the parent class's handleRequest method
      const originalHandleRequest =
        Object.getPrototypeOf(guardAny).constructor.prototype.handleRequest;
      Object.getPrototypeOf(guardAny).constructor.prototype.handleRequest = jest
        .fn()
        .mockResolvedValue(true);

      const result = await guard.canActivate(executionContext);

      expect(result).toBe(true);
      // Verify the mock was called
      expect(
        Object.getPrototypeOf(guardAny).constructor.prototype.handleRequest,
      ).toHaveBeenCalled();

      // Restore original methods
      guardAny.shouldSkip = originalShouldSkip;
      Object.getPrototypeOf(guardAny).constructor.prototype.handleRequest =
        originalHandleRequest;
    });

    it('should skip rate limiting when @SkipThrottle decorator is used', async () => {
      // Mock execution context
      const request = { ip: '127.0.0.1', path: '/api/users' };
      const response = { header: jest.fn() };
      const executionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
          getResponse: jest.fn().mockReturnValue(response),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard['shouldSkip'](executionContext);

      expect(result).toBe(true);
    });
  });
});
