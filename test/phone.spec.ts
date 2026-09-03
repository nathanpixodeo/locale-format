import { describe, expect, it } from 'vitest';
import { formatPhoneDisplay, getCallingCode, isValidPhone, parsePhone, toE164 } from '../src/index.js';

describe('parsePhone', () => {
  it('describes a national number given its country', () => {
    const info = parsePhone('0901234567', { country: 'VN' });
    expect(info).not.toBeNull();
    expect(info?.e164).toBe('+84901234567');
    expect(info?.country).toBe('VN');
    expect(info?.callingCode).toBe('+84');
    expect(info?.valid).toBe(true);
    expect(info?.possible).toBe(true);
    expect(info?.international).toContain('+84');
    expect(info?.rfc3966).toBe('tel:+84901234567');
    // The national form keeps Vietnam's trunk prefix.
    expect(info?.national.replace(/\D/g, '')).toBe('0901234567');
  });

  it('parses an international number without a country hint', () => {
    expect(parsePhone('+1 213 373 4253')?.country).toBe('US');
  });

  it('is case- and whitespace-insensitive about the country', () => {
    expect(parsePhone('0901234567', { country: ' vn ' })?.e164).toBe('+84901234567');
  });

  it('returns null for input that is not a phone number', () => {
    expect(parsePhone('')).toBeNull();
    expect(parsePhone('   ')).toBeNull();
    expect(parsePhone('hello')).toBeNull();
    expect(parsePhone(undefined as unknown as string)).toBeNull();
  });

  it('returns null for a national number with no country to anchor it', () => {
    expect(parsePhone('0901234567')).toBeNull();
  });

  it('ignores an unsupported country hint', () => {
    expect(parsePhone('+84901234567', { country: 'XX' })?.country).toBe('VN');
  });
});

describe('formatPhoneDisplay (FR-P1)', () => {
  it('defaults to the national format', () => {
    expect(formatPhoneDisplay('+84901234567').replace(/\D/g, '')).toBe('0901234567');
  });

  it('supports every documented format', () => {
    const phone = '0901234567';
    expect(formatPhoneDisplay(phone, { country: 'VN', format: 'e164' })).toBe('+84901234567');
    expect(formatPhoneDisplay(phone, { country: 'VN', format: 'rfc3966' })).toBe('tel:+84901234567');
    expect(formatPhoneDisplay(phone, { country: 'VN', format: 'international' })).toContain('+84');
    expect(
      formatPhoneDisplay(phone, { country: 'VN', format: 'national' }).replace(/\D/g, ''),
    ).toBe('0901234567');
  });

  it('returns partial input trimmed instead of blanking a live input', () => {
    expect(formatPhoneDisplay('  090  ', { country: 'VN' })).toBe('090');
    expect(formatPhoneDisplay(undefined as unknown as string)).toBe('');
  });
});

describe('isValidPhone (FR-P2)', () => {
  it('accepts a valid number', () => {
    expect(isValidPhone('0901234567', { country: 'VN' })).toBe(true);
    expect(isValidPhone('+84901234567')).toBe(true);
  });

  it('rejects a number that is too short', () => {
    expect(isValidPhone('090123', { country: 'VN' })).toBe(false);
  });

  it('rejects a foreign number when a country is required', () => {
    expect(isValidPhone('+1 213 373 4253', { country: 'VN' })).toBe(false);
    expect(isValidPhone('+1 213 373 4253', { country: 'US' })).toBe(true);
  });

  it('rejects junk', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('not a phone')).toBe(false);
  });
});

describe('toE164 (FR-P3)', () => {
  it('returns the storage form for a valid number', () => {
    expect(toE164('0901234567', { country: 'VN' })).toBe('+84901234567');
    expect(toE164('(213) 373-4253', { country: 'US' })).toBe('+12133734253');
  });

  it('returns null when the number is not valid', () => {
    expect(toE164('090123', { country: 'VN' })).toBeNull();
    expect(toE164('')).toBeNull();
  });
});

describe('getCallingCode (FR-P4)', () => {
  it('returns the calling code with a leading plus', () => {
    expect(getCallingCode('VN')).toBe('+84');
    expect(getCallingCode('us')).toBe('+1');
    expect(getCallingCode('JP')).toBe('+81');
  });

  it('returns an empty string for an unknown country', () => {
    expect(getCallingCode('XX')).toBe('');
    expect(getCallingCode('')).toBe('');
    expect(getCallingCode(undefined as unknown as string)).toBe('');
  });
});
