import { AppThrottlerGuard } from './common/guards/throttler.guard';
describe('Import Test', () => {
  it('should import', () => {
    expect(AppThrottlerGuard).toBeDefined();
  });
});
