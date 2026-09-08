import { DEFAULT_APP_CONFIG, isAppConfig, loadAppConfig } from './app-config';

describe('loadAppConfig', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('loads and normalizes config from URL', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        environmentName: 'Development',
        apiBaseUrl: 'http://localhost:5080/',
      }),
    }) as unknown as typeof fetch;

    const config = await loadAppConfig('/config.json');
    expect(config.apiBaseUrl).toBe('http://localhost:5080');
    expect(config.environmentName).toBe('Development');
  });

  it('falls back to defaults when fetch fails', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network')) as unknown as typeof fetch;

    const config = await loadAppConfig('/missing.json');
    expect(config).toEqual(DEFAULT_APP_CONFIG);
  });

  it('validates AppConfig shape', () => {
    expect(isAppConfig({ environmentName: 'Development', apiBaseUrl: 'x' })).toBe(
      true,
    );
    expect(isAppConfig({ apiBaseUrl: 'x' })).toBe(false);
    expect(isAppConfig(null)).toBe(false);
  });
});
