import type { AppConfig, HealthStatus } from '../index';

describe('contracts', () => {
  it('supports AppConfig shape', () => {
    const config: AppConfig = {
      environmentName: 'Development',
      apiBaseUrl: 'http://localhost:5080',
    };
    expect(config.apiBaseUrl).toContain('5080');
  });

  it('supports HealthStatus shape', () => {
    const health: HealthStatus = {
      status: 'Healthy',
      checkedAtUtc: new Date().toISOString(),
      api: { name: 'api', status: 'Healthy' },
      database: { name: 'database', status: 'Healthy' },
    };
    expect(health.status).toBe('Healthy');
  });
});
