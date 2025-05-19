import { AppThrottlerGuard } from './throttler.guard';
import { Reflector } from '@nestjs/core';

describe('AppThrottlerGuard', () => {
  it('should create with minimal dependencies', () => {
    const mockOptions = { throttlers: [{ ttl: 60000, limit: 5 }] };
    const mockStorage = {
      getRecord: () =>
        Promise.resolve({
          totalHits: 0,
          timeToExpire: 0,
          isBlocked: false,
          timeToBlockExpire: 0,
        }),
      increment: () =>
        Promise.resolve({
          totalHits: 1,
          timeToExpire: Date.now() + 60000,
          isBlocked: false,
          timeToBlockExpire: 0,
        }),
    };
    const mockReflector = {
      get: jest.fn(),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
      getAllAndOverride: jest.fn(),
    } as jest.Mocked<Reflector>;

    const guard = new AppThrottlerGuard(
      mockOptions,
      mockStorage,
      mockReflector,
    );

    expect(guard).toBeDefined();
  });
});
