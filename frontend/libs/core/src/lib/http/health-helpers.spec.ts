import type { HealthStatus } from '@erp/contracts';
import { isPlatformHealthy, summarizeHealth } from '../http/platform-health.service';

describe('health helpers', () => {
  const healthy: HealthStatus = {
    status: 'Healthy',
    checkedAtUtc: '2026-09-08T00:00:00Z',
    api: { name: 'api', status: 'Healthy' },
    database: { name: 'database', status: 'Healthy' },
  };

  it('summarizes status', () => {
    expect(summarizeHealth(healthy)).toBe('Healthy');
    expect(summarizeHealth(null)).toBe('Unknown');
  });

  it('detects healthy platform', () => {
    expect(isPlatformHealthy(healthy)).toBe(true);
    expect(
      isPlatformHealthy({
        ...healthy,
        status: 'Unhealthy',
        database: { name: 'database', status: 'Unhealthy' },
      }),
    ).toBe(false);
  });
});
