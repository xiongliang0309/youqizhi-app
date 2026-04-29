import { describe, expect, it } from 'vitest';
import { loopIndex } from '../lib/loopIndex';

describe('loopIndex', () => {
  it('total <= 0 时返回 0', () => {
    expect(loopIndex(0, 1, 0)).toBe(0);
  });

  it('向后翻页循环', () => {
    expect(loopIndex(0, 1, 3)).toBe(1);
    expect(loopIndex(2, 1, 3)).toBe(0);
  });

  it('向前翻页循环', () => {
    expect(loopIndex(2, -1, 3)).toBe(1);
    expect(loopIndex(0, -1, 3)).toBe(2);
  });
});

