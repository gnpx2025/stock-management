import { isNonEmptyString } from './shared';

describe('shared', () => {
  it('detects non-empty strings', () => {
    expect(isNonEmptyString('ok')).toBe(true);
    expect(isNonEmptyString('  ')).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });
});
