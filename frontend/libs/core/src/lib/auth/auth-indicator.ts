/** Non-sensitive session indicator cookie name (readable by JS when same-origin). */
export const AUTH_INDICATOR_COOKIE = 'erp_auth';

/**
 * Same-origin localStorage hint for cross-origin API deploys.
 * The `erp_auth` cookie is scoped to the API host, so Shell JS cannot read it
 * when `apiBaseUrl` points at a different origin (e.g. separate Render services).
 * This hint is not a secret — it only gates whether to attempt silent refresh.
 */
export const AUTH_HINT_STORAGE_KEY = 'erp.authHint';

/** True when the browser has the `erp_auth=1` indicator cookie. */
export function hasAuthIndicatorCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .some((part) => part.trim() === `${AUTH_INDICATOR_COOKIE}=1`);
}

/** True when Shell previously recorded a successful login/refresh on this origin. */
export function hasAuthSessionHint(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(AUTH_HINT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Whether bootstrap should attempt a silent refresh. */
export function shouldAttemptSessionRestore(): boolean {
  return hasAuthIndicatorCookie() || hasAuthSessionHint();
}

export function setAuthSessionHint(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_HINT_STORAGE_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}

export function clearAuthSessionHint(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_HINT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
