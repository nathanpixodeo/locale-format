import { describe, expect, it } from 'vitest';
import { formatAddress, formatAddressLines, getAddressFields, validatePostalCode } from '../src/index.js';
import { validatePostalCodeWith } from '../src/address/index.js';
import { genericCountrySpec } from '../src/core/fallback.js';

const vn = {
  country: 'VN' as const,
  fields: {
    street: '12 Nguyen Trai',
    ward: 'P.Ben Thanh',
    district: 'Q.1',
    city: 'TP.HCM',
  },
};

describe('formatAddress (FR-A1)', () => {
  it('formats a single line by default', () => {
    expect(formatAddress(vn)).toBe('12 Nguyen Trai, P.Ben Thanh, Q.1, TP.HCM');
  });

  it('joins lines with a custom separator, leaving within-line punctuation alone', () => {
    expect(formatAddress(vn, { separator: ' | ' })).toBe(
      '12 Nguyen Trai | P.Ben Thanh, Q.1 | TP.HCM',
    );
  });

  it('formats multiple lines on request (FR-A3)', () => {
    expect(formatAddress(vn, { layout: 'multi-line' })).toBe(
      '12 Nguyen Trai\nP.Ben Thanh, Q.1\nTP.HCM',
    );
  });

  it('drops the district tier abolished in 2025 without leaving punctuation', () => {
    expect(
      formatAddress({
        country: 'VN',
        fields: { street: '12 Nguyen Trai', ward: 'P.Ben Thanh', city: 'TP.HCM' },
      }),
    ).toBe('12 Nguyen Trai, P.Ben Thanh, TP.HCM');
  });

  it('accepts street as an alias of addressLine1 and vice versa', () => {
    const viaAddressLine = formatAddress({
      country: 'VN',
      fields: { addressLine1: '12 Nguyen Trai', ward: 'P.Ben Thanh', city: 'TP.HCM' },
    });
    expect(viaAddressLine).toBe('12 Nguyen Trai, P.Ben Thanh, TP.HCM');

    expect(formatAddress({ country: 'US', fields: { street: '1 Infinite Loop', city: 'Cupertino' } })).toBe(
      '1 Infinite Loop, Cupertino',
    );
  });

  it('treats state, province and prefecture as one administrative level', () => {
    expect(
      formatAddress({
        country: 'US',
        fields: { addressLine1: '1 Infinite Loop', city: 'Cupertino', province: 'CA', postalCode: '95014' },
      }),
    ).toBe('1 Infinite Loop, Cupertino, CA 95014');
  });

  it('coerces numbers and skips null and undefined values', () => {
    expect(
      formatAddress({
        country: 'US',
        fields: {
          addressLine1: 350,
          addressLine2: null,
          city: 'New York',
          state: undefined,
          postalCode: 10118,
        },
      }),
    ).toBe('350, New York, 10118');
  });

  it('appends a country name on request', () => {
    expect(formatAddress(vn, { includeCountry: true })).toBe(
      '12 Nguyen Trai, P.Ben Thanh, Q.1, TP.HCM, Vietnam',
    );
    expect(formatAddress(vn, { includeCountry: true, countryName: 'Viet Nam' })).toBe(
      '12 Nguyen Trai, P.Ben Thanh, Q.1, TP.HCM, Viet Nam',
    );
  });

  it('prefers an explicit country field over the spec name', () => {
    expect(
      formatAddress(
        { country: 'ZZ', fields: { addressLine1: '1 Main St', city: 'Nowhere', country: 'Elsewhere' } },
        { includeCountry: true },
      ),
    ).toBe('1 Main St, Nowhere, Elsewhere');
  });

  it('omits the country line when there is no name to print', () => {
    expect(
      formatAddress({ country: 'ZZ', fields: { addressLine1: '1 Main St' } }, { includeCountry: true }),
    ).toBe('1 Main St');
  });

  it('uses the Latin line order when asked, and the local one otherwise (FR-A5)', () => {
    const jp = {
      country: 'JP' as const,
      fields: {
        postalCode: '100-0001',
        prefecture: 'Tokyo',
        city: 'Chiyoda-ku',
        addressLine1: '1-1 Chiyoda',
        recipient: 'Tanaka Taro',
      },
    };
    expect(formatAddress(jp, { layout: 'multi-line' })).toBe(
      '〒100-0001\nTokyoChiyoda-ku1-1 Chiyoda\nTanaka Taro',
    );
    expect(formatAddress(jp, { layout: 'multi-line', script: 'latin' })).toBe(
      'Tanaka Taro\n1-1 Chiyoda\nChiyoda-ku, Tokyo 100-0001',
    );
  });

  it('falls back to the local order for a country with no Latin template', () => {
    expect(formatAddress(vn, { script: 'latin' })).toBe(formatAddress(vn));
  });

  it('falls back to the generic schema for an unsupported country (NFR-5)', () => {
    expect(
      formatAddress({
        country: 'XX',
        fields: { addressLine1: '1 Main St', city: 'Nowhere', state: 'NW', postalCode: '00000' },
      }),
    ).toBe('1 Main St, Nowhere NW 00000');
  });

  it('survives missing input', () => {
    expect(formatAddress({ country: 'VN', fields: {} })).toBe('');
    expect(formatAddress(undefined as never)).toBe('');
  });
});

describe('formatAddressLines', () => {
  it('returns one entry per non-empty line', () => {
    expect(formatAddressLines(vn)).toEqual(['12 Nguyen Trai', 'P.Ben Thanh, Q.1', 'TP.HCM']);
  });

  it('returns an empty array when nothing renders', () => {
    expect(formatAddressLines({ country: 'VN', fields: {} })).toEqual([]);
  });
});

describe('getAddressFields (FR-A2)', () => {
  it('returns the country schema ordered', () => {
    const fields = getAddressFields('JP');
    expect(fields.map((field) => field.name)).toEqual([
      'postalCode',
      'prefecture',
      'city',
      'addressLine1',
      'addressLine2',
      'recipient',
    ]);
    expect(fields[0]?.pattern).toBe('^\\d{3}-\\d{4}$');
  });

  it('returns copies, so callers cannot corrupt the shared spec', () => {
    const first = getAddressFields('VN');
    const target = first[0];
    if (!target) throw new Error('expected at least one field');
    target.label = 'mutated';
    expect(getAddressFields('VN')[0]?.label).not.toBe('mutated');
  });

  it('falls back to the generic schema for an unknown country', () => {
    expect(getAddressFields('XX').map((field) => field.name)).toEqual(
      genericCountrySpec.addressFields.map((field) => field.name),
    );
  });
});

describe('validatePostalCode (FR-A4)', () => {
  it('accepts values matching the country pattern', () => {
    expect(validatePostalCode('VN', '700000')).toBe(true);
    expect(validatePostalCode('US', '10118')).toBe(true);
    expect(validatePostalCode('US', '10118-0110')).toBe(true);
    expect(validatePostalCode('JP', '100-0001')).toBe(true);
    expect(validatePostalCode('NL', '1012 WX')).toBe(true);
  });

  it('rejects values that do not match', () => {
    expect(validatePostalCode('VN', '70000')).toBe(false);
    expect(validatePostalCode('US', 'ABCDE')).toBe(false);
    expect(validatePostalCode('JP', '1000001')).toBe(false);
  });

  it('uppercases input before matching', () => {
    expect(validatePostalCode('CA', 'k1a 0b1')).toBe(true);
    expect(validatePostalCode('GB', 'sw1a 1aa')).toBe(true);
  });

  it('rejects an empty value when the country has a rule', () => {
    expect(validatePostalCode('VN', '')).toBe(false);
    expect(validatePostalCode('VN', '   ')).toBe(false);
    expect(validatePostalCode('VN', undefined as unknown as string)).toBe(false);
  });

  it('is permissive for countries with no postal code system', () => {
    expect(validatePostalCode('HK', '')).toBe(true);
    expect(validatePostalCode('XX', 'anything')).toBe(true);
  });

  it('accepts anything when the stored pattern is not a valid regex', () => {
    const broken = { ...genericCountrySpec, postalCode: { pattern: '^[', example: 'x' } };
    expect(validatePostalCodeWith(broken, 'whatever')).toBe(true);
  });
});
