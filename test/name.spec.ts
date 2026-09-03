import { describe, expect, it } from 'vitest';
import { formatName, getNameOrder } from '../src/index.js';

describe('getNameOrder (FR-N1)', () => {
  it('reports the country convention', () => {
    expect(getNameOrder('JP')).toBe('family-first');
    expect(getNameOrder('VN')).toBe('family-first');
    expect(getNameOrder('KR')).toBe('family-first');
    expect(getNameOrder('CN')).toBe('family-first');
    expect(getNameOrder('US')).toBe('given-first');
    expect(getNameOrder('FR')).toBe('given-first');
  });

  it('defaults an unknown country to given-first', () => {
    expect(getNameOrder('XX')).toBe('given-first');
  });
});

describe('formatName', () => {
  const parts = { given: 'Taro', middle: 'K', family: 'Tanaka' };

  it('puts the family name first where the country does', () => {
    expect(formatName(parts, { country: 'JP' })).toBe('Tanaka K Taro');
  });

  it('puts the given name first elsewhere', () => {
    expect(formatName(parts, { country: 'US' })).toBe('Taro K Tanaka');
  });

  it('defaults to given-first with no country', () => {
    expect(formatName(parts)).toBe('Taro K Tanaka');
  });

  it('lets an explicit order override the country', () => {
    expect(formatName(parts, { country: 'JP', order: 'given-first' })).toBe('Taro K Tanaka');
  });

  it('honours a custom separator', () => {
    expect(formatName(parts, { country: 'JP', separator: '　' })).toBe('Tanaka　K　Taro');
  });

  it('skips missing, blank and non-string parts', () => {
    expect(formatName({ given: 'Taro', family: 'Tanaka' }, { country: 'JP' })).toBe('Tanaka Taro');
    expect(formatName({ given: '  ', family: 'Tanaka' })).toBe('Tanaka');
    expect(formatName({ given: 'Taro', middle: null, family: undefined })).toBe('Taro');
    expect(formatName({} as never)).toBe('');
    expect(formatName(undefined as never)).toBe('');
  });
});
