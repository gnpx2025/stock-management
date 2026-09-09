import type {
  AppConfig,
  AuthSession,
  AuthTokenResponse,
  HealthStatus,
  LoginRequest,
  TokenStorage,
} from '../index';

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

  it('supports auth contract shapes', () => {
    const login: LoginRequest = {
      usernameOrEmail: 'admin',
      password: 'secret',
    };
    const token: AuthTokenResponse = {
      accessToken: 'jwt',
      expiresAt: new Date().toISOString(),
      user: { id: '1', userName: 'admin', email: null },
    };
    const session: AuthSession = {
      status: 'authenticated',
      user: token.user,
      accessTokenExpiresAt: token.expiresAt,
    };
    const storage: TokenStorage = {
      getAccessToken: () => null,
      setAccessToken: () => undefined,
      clear: () => undefined,
    };
    expect(login.usernameOrEmail).toBe('admin');
    expect(session.status).toBe('authenticated');
    expect(storage.getAccessToken()).toBeNull();
  });
});
