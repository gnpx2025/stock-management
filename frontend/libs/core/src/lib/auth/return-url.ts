/**
 * Returns a safe relative in-app path only.
 * Rejects absolute URLs, protocol-relative URLs, and empty values.
 */
export function safeReturnUrl(
  value: unknown,
  fallback = '/',
): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  // Must be a same-origin relative path starting with a single slash.
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  // Reject embedded schemes (e.g. /\\evil.com or path with ://).
  if (trimmed.includes('://') || trimmed.includes('\\')) {
    return fallback;
  }

  return trimmed;
}
