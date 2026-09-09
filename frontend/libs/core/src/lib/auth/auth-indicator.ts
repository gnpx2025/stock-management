/** Non-sensitive session indicator cookie name (readable by JS). */
export const AUTH_INDICATOR_COOKIE = 'erp_auth';

/** True when the browser has the `erp_auth=1` indicator cookie. */
export function hasAuthIndicatorCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .some((part) => part.trim() === `${AUTH_INDICATOR_COOKIE}=1`);
}
