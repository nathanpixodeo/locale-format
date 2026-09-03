import { afterEach, describe, expect, it } from 'vitest';
import { clearIntlCache, formatDate, formatDateTime, formatTime } from '../src/index.js';
import { getDateTimeFormat } from '../src/core/intl-cache.js';

/** 2024-03-15T09:30:00Z, formatted in UTC so assertions do not drift by machine. */
const MOMENT = Date.UTC(2024, 2, 15, 9, 30, 0);
const UTC = { timeZone: 'UTC' } as const;

afterEach(() => {
  clearIntlCache();
});

describe('formatDate (FR-D1)', () => {
  it('defaults to a medium date in the country locale', () => {
    expect(formatDate(MOMENT, { country: 'US', ...UTC })).toBe('Mar 15, 2024');
    expect(formatDate(MOMENT, { country: 'GB', ...UTC })).toBe('15 Mar 2024');
  });

  it('accepts a Date, a timestamp and an ISO string', () => {
    const expected = formatDate(MOMENT, { locale: 'en-US', ...UTC });
    expect(formatDate(new Date(MOMENT), { locale: 'en-US', ...UTC })).toBe(expected);
    expect(formatDate('2024-03-15T09:30:00Z', { locale: 'en-US', ...UTC })).toBe(expected);
  });

  it('lets an explicit locale win over the country', () => {
    expect(formatDate(MOMENT, { country: 'US', locale: 'de-DE', ...UTC })).toBe('15.03.2024');
  });

  it('drops the default shape once the caller specifies one', () => {
    expect(formatDate(MOMENT, { locale: 'en-US', year: 'numeric', month: 'long', ...UTC })).toBe(
      'March 2024',
    );
  });

  it('returns an empty string for an unusable date', () => {
    expect(formatDate('not a date')).toBe('');
    expect(formatDate(Number.NaN)).toBe('');
    expect(formatDate(new Date('nope'))).toBe('');
  });

  it('falls back to the runtime locale for an unknown country', () => {
    expect(formatDate(MOMENT, { country: 'XX', ...UTC })).toBeTypeOf('string');
  });
});

describe('formatTime', () => {
  it('defaults to a short time', () => {
    expect(formatTime(MOMENT, { locale: 'en-GB', ...UTC })).toBe('09:30');
  });

  it('respects an explicit shape', () => {
    expect(formatTime(MOMENT, { locale: 'en-GB', hour: '2-digit', ...UTC })).toBe('09');
  });

  it('returns an empty string for an unusable date', () => {
    expect(formatTime('nope')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('combines a medium date with a short time', () => {
    expect(formatDateTime(MOMENT, { locale: 'en-GB', ...UTC })).toBe('15 Mar 2024, 09:30');
  });

  it('returns an empty string for an unusable date', () => {
    expect(formatDateTime('nope')).toBe('');
  });
});

describe('date/time Intl cache', () => {
  it('reuses formatter instances', () => {
    const first = getDateTimeFormat('en-US', { dateStyle: 'short' });
    expect(getDateTimeFormat('en-US', { dateStyle: 'short' })).toBe(first);
    clearIntlCache();
    expect(getDateTimeFormat('en-US', { dateStyle: 'short' })).not.toBe(first);
  });

  it('degrades instead of throwing on a bad locale', () => {
    expect(() => getDateTimeFormat('not a locale', {}).format(MOMENT)).not.toThrow();
  });

  it('degrades when both the locale and the options are unusable', () => {
    expect(
      getDateTimeFormat('not a locale', { timeZone: 'Mars/Olympus' }).format(MOMENT),
    ).toBeTypeOf('string');
  });
});
