import { afterEach, describe, expect, it } from 'vitest';
import { clearIntlCache, formatCurrency, formatNumber, getCurrencyCode } from '../src/index.js';
import { getNumberFormat } from '../src/core/intl-cache.js';

/** Digits only, so assertions do not depend on the ICU version's separators. */
function digits(value: string): string {
  return value.replace(/\D/g, '');
}

afterEach(() => {
  clearIntlCache();
});

describe('formatNumber (FR-C2)', () => {
  it('uses the country locale separators', () => {
    expect(formatNumber(1234567.89, { country: 'DE' })).toBe('1.234.567,89');
    expect(formatNumber(1234567.89, { country: 'US' })).toBe('1,234,567.89');
  });

  it('lets an explicit locale win over the country', () => {
    expect(formatNumber(1234.5, { country: 'US', locale: 'de-DE' })).toBe('1.234,5');
  });

  it('passes Intl options straight through', () => {
    expect(
      formatNumber(0.256, { locale: 'en-US', style: 'percent', maximumFractionDigits: 1 }),
    ).toBe('25.6%');
  });

  it('returns an empty string for values Intl cannot format', () => {
    expect(formatNumber(Number.NaN)).toBe('');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('');
    expect(formatNumber(undefined as unknown as number)).toBe('');
  });

  it('falls back to the runtime locale for an unknown country', () => {
    expect(digits(formatNumber(1234.5, { country: 'XX' }))).toBe('12345');
  });
});

describe('formatCurrency (FR-C1)', () => {
  it('formats with the country currency and symbol placement', () => {
    const vnd = formatCurrency(1234567, { country: 'VN' });
    expect(vnd).toContain('₫');
    expect(digits(vnd)).toBe('1234567');

    const usd = formatCurrency(1234.5, { country: 'US' });
    expect(usd).toBe('$1,234.50');
  });

  it('lets an explicit currency override the country', () => {
    expect(formatCurrency(1234.5, { country: 'US', currency: 'EUR' })).toBe('€1,234.50');
  });

  it('accepts a currency with no country', () => {
    expect(formatCurrency(1234.5, { locale: 'en-US', currency: 'JPY' })).toBe('¥1,235');
  });

  it('falls back to a plain number when no currency can be resolved', () => {
    const result = formatCurrency(1234.5, { locale: 'en-US' });
    expect(result).toBe('1,234.5');
  });

  it('does not leave style: currency set without a currency code', () => {
    expect(formatCurrency(1234.5, { locale: 'en-US', style: 'currency' })).toBe('1,234.5');
  });

  it('keeps a non-currency style when no currency is resolved', () => {
    expect(formatCurrency(0.25, { locale: 'en-US', style: 'percent' })).toBe('25%');
  });

  it('returns an empty string for non-finite values', () => {
    expect(formatCurrency(Number.NaN, { country: 'VN' })).toBe('');
  });
});

describe('getCurrencyCode', () => {
  it('returns the ISO 4217 code', () => {
    expect(getCurrencyCode('VN')).toBe('VND');
    expect(getCurrencyCode('jp')).toBe('JPY');
    expect(getCurrencyCode('DE')).toBe('EUR');
  });

  it('returns an empty string for an unknown country', () => {
    expect(getCurrencyCode('XX')).toBe('');
  });
});

describe('Intl cache', () => {
  it('reuses formatter instances', () => {
    const first = getNumberFormat('en-US', { style: 'decimal' });
    expect(getNumberFormat('en-US', { style: 'decimal' })).toBe(first);
    clearIntlCache();
    expect(getNumberFormat('en-US', { style: 'decimal' })).not.toBe(first);
  });

  it('evicts entries once the cache is full', () => {
    const first = getNumberFormat('en-US', { minimumFractionDigits: 0 });
    for (let i = 0; i < 220; i += 1) {
      getNumberFormat('en-US', {
        minimumIntegerDigits: (i % 21) + 1,
        minimumFractionDigits: Math.floor(i / 21),
      });
    }
    expect(getNumberFormat('en-US', { minimumFractionDigits: 0 })).not.toBe(first);
  });

  it('degrades to the runtime default instead of throwing on a bad locale', () => {
    expect(() => getNumberFormat('not a locale', {}).format(1)).not.toThrow();
  });

  it('degrades when both the locale and the options are unusable', () => {
    expect(
      getNumberFormat('not a locale', { style: 'currency', currency: 'not a currency' }).format(1),
    ).toBeTypeOf('string');
  });
});
