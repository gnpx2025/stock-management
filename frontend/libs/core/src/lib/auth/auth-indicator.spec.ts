/**
 * @jest-environment jsdom
 */
import {
  AUTH_HINT_STORAGE_KEY,
  AUTH_INDICATOR_COOKIE,
  clearAuthSessionHint,
  hasAuthIndicatorCookie,
  hasAuthSessionHint,
  setAuthSessionHint,
  shouldAttemptSessionRestore,
} from './auth-indicator';

describe('auth-indicator', () => {
  beforeEach(() => {
    document.cookie = `${AUTH_INDICATOR_COOKIE}=; Max-Age=0; Path=/`;
    localStorage.removeItem(AUTH_HINT_STORAGE_KEY);
  });

  it('detects indicator cookie', () => {
    expect(hasAuthIndicatorCookie()).toBe(false);
    document.cookie = `${AUTH_INDICATOR_COOKIE}=1; Path=/`;
    expect(hasAuthIndicatorCookie()).toBe(true);
  });

  it('uses localStorage hint for cross-origin restore gating', () => {
    expect(hasAuthSessionHint()).toBe(false);
    expect(shouldAttemptSessionRestore()).toBe(false);

    setAuthSessionHint();
    expect(hasAuthSessionHint()).toBe(true);
    expect(shouldAttemptSessionRestore()).toBe(true);
    expect(localStorage.getItem(AUTH_HINT_STORAGE_KEY)).toBe('1');

    clearAuthSessionHint();
    expect(hasAuthSessionHint()).toBe(false);
    expect(shouldAttemptSessionRestore()).toBe(false);
  });
});
