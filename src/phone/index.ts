import {
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode as LibCountryCode,
  type PhoneNumber,
} from 'libphonenumber-js';
import type { CountryCodeInput } from '../core/types.js';

export type PhoneFormat = 'national' | 'international' | 'e164' | 'rfc3966';

export interface PhoneOptions {
  /** Default country for numbers written without a `+` prefix. */
  country?: CountryCodeInput;
  /** Output shape. Defaults to `national`. */
  format?: PhoneFormat;
}

export interface PhoneInfo {
  /** E.164, the form to store (FR-P3). */
  e164: string;
  national: string;
  international: string;
  rfc3966: string;
  /** Country libphonenumber inferred, when it could tell. */
  country: CountryCodeInput | undefined;
  /** Calling code including the leading plus. */
  callingCode: string;
  valid: boolean;
  /** Length and prefix are plausible even if the number is not assignable. */
  possible: boolean;
}

function toLibCountry(code: CountryCodeInput | undefined): LibCountryCode | undefined {
  if (typeof code !== 'string') return undefined;
  const upper = code.trim().toUpperCase();
  return isSupportedCountry(upper) ? (upper as LibCountryCode) : undefined;
}

function parse(phone: string, country?: CountryCodeInput): PhoneNumber | undefined {
  if (typeof phone !== 'string' || !phone.trim()) return undefined;

  const defaultCountry = toLibCountry(country);
  try {
    return defaultCountry
      ? parsePhoneNumberFromString(phone, defaultCountry)
      : parsePhoneNumberFromString(phone);
  } catch {
    // parsePhoneNumberFromString is documented as non-throwing; this guards
    // against malformed metadata or a future behaviour change.
    return undefined;
  }
}

/** Full parse result, or `null` when the input is not a phone number at all. */
export function parsePhone(phone: string, options: PhoneOptions = {}): PhoneInfo | null {
  const parsed = parse(phone, options.country);
  if (!parsed) return null;

  return {
    e164: parsed.number,
    national: parsed.formatNational(),
    international: parsed.formatInternational(),
    rfc3966: parsed.format('RFC3966'),
    country: parsed.country,
    callingCode: parsed.countryCallingCode ? `+${parsed.countryCallingCode}` : '',
    valid: parsed.isValid(),
    possible: parsed.isPossible(),
  };
}

/**
 * FR-P1: display form of a phone number.
 *
 * Unparseable input is returned trimmed rather than blanked, so a half-typed
 * number in a live-formatting input does not vanish under the user.
 */
export function formatPhoneDisplay(phone: string, options: PhoneOptions = {}): string {
  const parsed = parse(phone, options.country);
  if (!parsed) return typeof phone === 'string' ? phone.trim() : '';

  switch (options.format ?? 'national') {
    case 'international':
      return parsed.formatInternational();
    case 'e164':
      return parsed.number;
    case 'rfc3966':
      return parsed.format('RFC3966');
    default:
      return parsed.formatNational();
  }
}

/**
 * FR-P2: whether the number is valid.
 *
 * When `country` is given, a number belonging to a different country is
 * rejected — otherwise `+1 213 373 4253` would pass a Vietnam-only form.
 */
export function isValidPhone(phone: string, options: PhoneOptions = {}): boolean {
  const parsed = parse(phone, options.country);
  if (!parsed) return false;

  const expected = toLibCountry(options.country);
  if (expected && parsed.country && parsed.country !== expected) return false;

  return parsed.isValid();
}

/** FR-P3: E.164 for storage, or `null` when the number is not valid. */
export function toE164(phone: string, options: PhoneOptions = {}): string | null {
  const parsed = parse(phone, options.country);
  return parsed?.isValid() ? parsed.number : null;
}

/** FR-P4: calling code for a country, e.g. `'+84'`. `''` when unknown. */
export function getCallingCode(country: CountryCodeInput): string {
  const code = toLibCountry(country);
  if (!code) return '';

  try {
    return `+${getCountryCallingCode(code)}`;
  } catch {
    return '';
  }
}
