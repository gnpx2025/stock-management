import { safeReturnUrl } from './return-url';

describe('safeReturnUrl', () => {
  it('allows relative in-app paths', () => {
    expect(safeReturnUrl('/')).toBe('/');
    expect(safeReturnUrl('/foundation')).toBe('/foundation');
  });

  it('rejects external and protocol-relative URLs by falling back', () => {
    expect(safeReturnUrl('https://evil.example')).toBe('/');
    expect(safeReturnUrl('//evil.example')).toBe('/');
    expect(safeReturnUrl('javascript:alert(1)')).toBe('/');
  });
});
