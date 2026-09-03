/**
 * Locks the worked examples printed in section 5.3 of the SRS. If one of these
 * changes, the published behaviour no longer matches the specification the
 * package was commissioned against.
 */
import { describe, expect, it } from 'vitest';
import { formatAddress, getAddressFields, getCallingCode, isValidPhone, toE164 } from '../src/index.js';

describe('SRS section 5.3 examples', () => {
  it('formats the Vietnamese address exactly as documented', () => {
    expect(
      formatAddress({
        country: 'VN',
        fields: {
          street: '12 Nguyen Trai',
          ward: 'P.Ben Thanh',
          district: 'Q.1',
          city: 'TP.HCM',
        },
      }),
    ).toBe('12 Nguyen Trai, P.Ben Thanh, Q.1, TP.HCM');
  });

  it('returns the documented Japanese form schema', () => {
    const fields = getAddressFields('JP');

    expect(fields.slice(0, 4).map(({ name, label, required, pattern }) => ({
      name,
      label,
      required,
      ...(pattern ? { pattern } : {}),
    }))).toEqual([
      { name: 'postalCode', label: 'Postal Code', required: true, pattern: '^\\d{3}-\\d{4}$' },
      { name: 'prefecture', label: 'Prefecture', required: true },
      { name: 'city', label: 'City / Ward', required: true },
      // The SRS calls this `addressLine`; the library ships two numbered lines
      // because several countries need both.
      { name: 'addressLine1', label: 'Address Line', required: true },
    ]);
  });

  it('normalises Vietnamese phone numbers as documented', () => {
    expect(isValidPhone('0901234567', { country: 'VN' })).toBe(true);
    expect(toE164('0901234567', { country: 'VN' })).toBe('+84901234567');
    expect(getCallingCode('VN')).toBe('+84');
  });
});

describe('NFR-5 fallback', () => {
  it('formats an unsupported country with the generic schema', () => {
    expect(
      formatAddress({
        country: 'ZW',
        fields: {
          addressLine1: '12 Samora Machel Ave',
          city: 'Harare',
        },
      }),
    ).toBe('12 Samora Machel Ave, Harare');
    expect(getAddressFields('ZW').map((field) => field.name)).toContain('postalCode');
  });
});
